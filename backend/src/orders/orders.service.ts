import { Inject, Injectable } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { Prisma, OrderStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service.js';
import { apiError } from '../common/api-error.js';
import { CreateOrderDto } from './order.dto.js';
import {
  lockIdempotency,
  requestHash,
  requireIdempotencyKey,
  verifyRequestHash,
} from './idempotency.js';
import { orderInclude, orderResponse } from './order-response.js';
import { reserveInventory, releaseInventory } from './inventory.js';
import { assertTransition } from './order-state.js';

@Injectable()
export class OrdersService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async createOrder(
    userId: string,
    dto: CreateOrderDto,
    rawKey: string | undefined,
  ) {
    const key = requireIdempotencyKey(rawKey);
    const hash = requestHash({
      items: dto.items.map((item) => ({
        productId: item.productId.toLowerCase(),
        sizeCode: item.sizeCode,
        toppingIds: [...item.toppingIds].map((id) => id.toLowerCase()).sort(),
        quantity: item.quantity,
      })),
      expectedSubtotal: dto.expectedSubtotal,
      voucherCode: dto.voucherCode ?? null,
    });
    return this.prisma.$transaction(
      async (tx) => {
        await lockIdempotency(tx, userId, 'orders', key);
        const existing = await tx.order.findUnique({
          where: {
            userId_creationIdempotencyKey: {
              userId,
              creationIdempotencyKey: key,
            },
          },
        });
        if (existing) {
          verifyRequestHash(existing.requestHash, hash);
          return existing.creationResponse;
        }
        const items: Prisma.OrderItemCreateWithoutOrderInput[] = [];
        let subtotal = 0;
        for (const item of dto.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            include: {
              sizes: { include: { size: true } },
              toppings: { include: { topping: true } },
            },
          });
          const size = product?.sizes.find(
            (option) => option.sizeCode === item.sizeCode,
          )?.size;
          if (!product || !size)
            throw apiError(
              400,
              'VALIDATION_ERROR',
              'Product or size is invalid.',
            );
          const toppingIds = item.toppingIds.map((id) => id.toLowerCase());
          const toppings = toppingIds.map(
            (id) =>
              product.toppings.find((option) => option.toppingId === id)
                ?.topping,
          );
          if (
            new Set(toppingIds).size !== toppingIds.length ||
            toppings.some((topping) => !topping)
          )
            throw apiError(
              400,
              'VALIDATION_ERROR',
              'A topping does not belong to this product.',
            );
          const validToppings = toppings.filter(
            (topping) => topping !== undefined,
          );
          const unitPrice =
            product.basePrice +
            size.priceDelta +
            validToppings.reduce((sum, topping) => sum + topping.price, 0);
          const lineTotal = unitPrice * item.quantity;
          subtotal += lineTotal;
          if (
            !Number.isSafeInteger(subtotal) ||
            subtotal > 2147483647 ||
            unitPrice > 2147483647
          )
            throw apiError(
              400,
              'VALIDATION_ERROR',
              'Order total exceeds the supported amount.',
            );
          items.push({
            product: { connect: { id: product.id } },
            size: { connect: { code: size.code } },
            quantity: item.quantity,
            productNameSnapshot: product.name,
            sizePriceSnapshot: size.priceDelta,
            unitPrice,
            lineTotal,
            toppings: {
              create: validToppings.map((topping) => ({
                topping: { connect: { id: topping.id } },
                nameSnapshot: topping.name,
                priceSnapshot: topping.price,
              })),
            },
          });
        }
        if (subtotal !== dto.expectedSubtotal)
          throw apiError(
            409,
            'PRICE_CHANGED',
            'Prices changed. Confirm the current subtotal before ordering.',
            { subtotal },
          );
        let discount = 0;
        let promotionId: string | undefined;
        if (dto.voucherCode !== undefined) {
          const promotion = await tx.promotion.findUnique({
            where: { code: dto.voucherCode },
          });
          const now = new Date();
          if (
            !promotion ||
            !promotion.isActive ||
            promotion.validFrom > now ||
            promotion.expiresAt <= now ||
            subtotal < promotion.minOrderValue ||
            promotion.amount >= subtotal
          )
            throw apiError(
              422,
              'INVALID_VOUCHER',
              'The voucher is invalid or does not apply to this order.',
            );
          discount = promotion.amount;
          promotionId = promotion.id;
        }
        await reserveInventory(tx, dto.items);
        const order = await tx.order.create({
          data: {
            userId,
            promotionId,
            subtotal,
            discount,
            total: subtotal - discount,
            voucherCodeSnapshot: dto.voucherCode,
            creationIdempotencyKey: key,
            requestHash: hash,
            creationResponse: {},
            items: { create: items },
          },
          include: orderInclude,
        });
        const response = orderResponse(order);
        await tx.order.update({
          where: { id: order.id },
          data: { creationResponse: response },
        });
        return response;
      },
      { timeout: 10000 },
    );
  }

  async getMyOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: orderInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
    return orders.map(orderResponse);
  }

  async getOrderById(userId: string, id: string) {
    if (!isUUID(id)) throw apiError(404, 'NOT_FOUND', 'Order not found.');
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: orderInclude,
    });
    if (!order) throw apiError(404, 'NOT_FOUND', 'Order not found.');
    return orderResponse(order);
  }

  // Internal service only: no customer route can invoke staff transitions or cancellation.
  async transitionOrder(id: string, target: OrderStatus) {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Order" WHERE id = ${id}::uuid FOR UPDATE`;
      const order = await tx.order.findUnique({
        where: { id },
        include: orderInclude,
      });
      if (!order) throw apiError(404, 'NOT_FOUND', 'Order not found.');
      if (order.status === target) return orderResponse(order);
      if (
        target === 'PAID' ||
        target === 'PAYMENT_FAILED' ||
        target === 'PENDING'
      )
        throw apiError(
          409,
          'INVALID_ORDER_STATE',
          'Payment transitions must use the payment service.',
        );
      assertTransition(order.status, target);
      if (target === 'CANCELLED') {
        if (order.inventoryStatus !== 'RELEASED')
          await releaseInventory(tx, order.items);
        if (order.status === 'PAID') {
          await tx.payment.updateMany({
            where: { orderId: id, status: 'SUCCEEDED' },
            data: { status: 'REFUNDED' },
          });
          const earned = await tx.loyaltyTransaction.findUniqueOrThrow({
            where: { orderId_kind: { orderId: id, kind: 'EARN' } },
          });
          await tx.loyaltyTransaction.create({
            data: {
              userId: order.userId,
              orderId: id,
              kind: 'REVERSAL',
              points: -earned.points,
            },
          });
          await tx.user.update({
            where: { id: order.userId },
            data: { loyaltyPoints: { decrement: earned.points } },
          });
        }
      }
      const changed = await tx.order.update({
        where: { id, version: order.version },
        data: {
          status: target,
          inventoryStatus:
            target === 'CANCELLED' ? 'RELEASED' : order.inventoryStatus,
          version: { increment: 1 },
        },
        include: orderInclude,
      });
      return orderResponse(changed);
    });
  }
}
