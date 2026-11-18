import type { ProductDetail, SizeCode } from "./api";

export function calculateProductTotal(product: ProductDetail, size: SizeCode, toppingIds: string[], quantity: number) {
  const sizePrice = product.sizes.find((option) => option.code === size)?.priceDelta ?? 0;
  const toppingPrice = product.toppings.reduce((total, topping) => total + (toppingIds.includes(topping.id) ? topping.price : 0), 0);
  return (product.basePrice + sizePrice + toppingPrice) * quantity;
}
