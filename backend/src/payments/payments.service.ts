import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { MockPaymentGateway } from './mock-payment.gateway.js';
import { CreatePaymentDto } from '../orders/order.dto.js';
import { orderInclude } from '../orders/order-response.js';
import {
  lockIdempotency,
  requestHash,
  requireIdempotencyKey,
  verifyRequestHash,
} from '../orders/idempotency.js';
import { reserveInventory, releaseInventory } from '../orders/inventory.js';
import { assertTransition } from '../orders/order-state.js';
import { apiError } from '../common/api-error.js';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MockPaymentGateway) private readonly gateway: MockPaymentGateway,
  ) {}

  async createPayment(
    userId: string,
    dto: CreatePaymentDto,
    rawKey: string | undefined,
  ) {
    const key = requireIdempotencyKey(rawKey);
    const hash = requestHash({
      orderId: dto.orderId.toLowerCase(),
      method: dto.method,
    });
    return this.prisma.$transaction(
      async (tx) => {
        await lockIdempotency(tx, userId, 'payments', key);
        const existing = await tx.payment.findUnique({
          where: { userId_idempotencyKey: { userId, idempotencyKey: key } },
        });
        if (existing) {
          verifyRequestHash(existing.requestHash, hash);
          return existing.response;
        }
        await tx.$queryRaw`SELECT id FROM "Order" WHERE id = ${dto.orderId}::uuid AND "userId" = ${userId}::uuid FOR UPDATE`;
        let order = await tx.order.findFirst({
          where: { id: dto.orderId, userId },
          include: orderInclude,
        });
        if (!order) throw apiError(404, 'NOT_FOUND', 'Order not found.');
        if (order.status === 'PAYMENT_FAILED') {
          assertTransition(order.status, 'PENDING');
          await reserveInventory(tx, order.items);
          order = await tx.order.update({
            where: { id: order.id, version: order.version },
            data: {
              status: 'PENDING',
              inventoryStatus: 'RESERVED',
              version: { increment: 1 },
            },
            include: orderInclude,
          });
        }
        if (order.status !== 'PENDING' || order.inventoryStatus !== 'RESERVED')
          throw apiError(
            409,
            'INVALID_ORDER_STATE',
            'This order cannot be paid again.',
          );
        const result = this.gateway.charge();
        const orderStatus = result === 'SUCCEEDED' ? 'PAID' : 'PAYMENT_FAILED';
        assertTransition(order.status, orderStatus);
        if (result === 'FAILED') await releaseInventory(tx, order.items);
        await tx.order.update({
          where: { id: order.id, version: order.version },
          data: {
            status: orderStatus,
            inventoryStatus: result === 'SUCCEEDED' ? 'COMMITTED' : 'RELEASED',
            version: { increment: 1 },
          },
        });
        if (result === 'SUCCEEDED') {
          const points = Math.floor(order.total / 10000);
          await tx.loyaltyTransaction.create({
            data: { userId, orderId: order.id, kind: 'EARN', points },
          });
          await tx.user.update({
            where: { id: userId },
            data: { loyaltyPoints: { increment: points } },
          });
        }
        const payment = await tx.payment.create({
          data: {
            userId,
            orderId: order.id,
            idempotencyKey: key,
            requestHash: hash,
            amount: order.total,
            method: dto.method,
            status: result,
            response: {},
          },
        });
        const response = {
          id: payment.id,
          orderId: order.id,
          amount: order.total,
          method: dto.method,
          status: result,
          orderStatus,
        };
        await tx.payment.update({
          where: { id: payment.id },
          data: { response },
        });
        return response;
      },
      { timeout: 10000 },
    );
  }
}
