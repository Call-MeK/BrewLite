import type { Prisma } from '@prisma/client';
import { apiError } from '../common/api-error.js';

export async function reserveInventory(
  tx: Prisma.TransactionClient,
  items: readonly { productId: string; quantity: number }[],
) {
  const quantities = new Map<string, number>();
  for (const item of items)
    quantities.set(
      item.productId,
      (quantities.get(item.productId) ?? 0) + item.quantity,
    );
  // Stable lock order avoids deadlocks for carts that contain the same products.
  for (const [id, quantity] of [...quantities].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const product = await tx.product.findUnique({ where: { id } });
    if (!product || product.stock < quantity)
      throw apiError(409, 'OUT_OF_STOCK', 'A product is out of stock.', {
        productId: id,
      });
    const result = await tx.product.updateMany({
      where: { id, version: product.version, stock: { gte: quantity } },
      data: { stock: { decrement: quantity }, version: { increment: 1 } },
    });
    if (result.count !== 1)
      throw apiError(
        409,
        'OUT_OF_STOCK',
        'Stock changed. Please reload the menu.',
        { productId: id },
      );
  }
}

export async function releaseInventory(
  tx: Prisma.TransactionClient,
  items: readonly { productId: string; quantity: number }[],
) {
  const quantities = new Map<string, number>();
  for (const item of items)
    quantities.set(
      item.productId,
      (quantities.get(item.productId) ?? 0) + item.quantity,
    );
  for (const [id, quantity] of [...quantities].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    await tx.product.update({
      where: { id },
      data: { stock: { increment: quantity }, version: { increment: 1 } },
    });
  }
}
