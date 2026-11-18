import { Prisma } from '@prisma/client';

export const orderInclude = {
  items: { include: { toppings: true }, orderBy: { id: 'asc' as const } },
} satisfies Prisma.OrderInclude;
export type OrderWithItems = Prisma.OrderGetPayload<{
  include: typeof orderInclude;
}>;

export function orderResponse(order: OrderWithItems) {
  return {
    id: order.id,
    userId: order.userId,
    status: order.status,
    inventoryStatus: order.inventoryStatus,
    subtotal: order.subtotal,
    discount: order.discount,
    total: order.total,
    voucherCode: order.voucherCodeSnapshot,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productNameSnapshot,
      sizeCode: item.sizeCode,
      sizePrice: item.sizePriceSnapshot,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
      toppings: item.toppings.map((topping) => ({
        toppingId: topping.toppingId,
        name: topping.nameSnapshot,
        price: topping.priceSnapshot,
      })),
    })),
  };
}
