import { HttpException, Inject, Injectable } from '@nestjs/common';
import type { Product } from '@prisma/client';
import { isUUID } from 'class-validator';
import { PrismaService } from '../database/prisma.service.js';

function productSummary(product: Product) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    imageUrl: product.imageUrl,
    basePrice: product.basePrice,
    stock: product.stock,
    isAvailable: product.stock > 0,
  };
}

function notFound() {
  return new HttpException(
    {
      statusCode: 404,
      code: 'PRODUCT_NOT_FOUND',
      message: 'Product not found',
    },
    404,
  );
}

@Injectable()
export class ProductsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getProducts() {
    const products = await this.prisma.product.findMany({
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
    return products.map(productSummary);
  }

  async getProductById(id: string) {
    if (!isUUID(id)) throw notFound();
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        sizes: { include: { size: true }, orderBy: { sizeCode: 'asc' } },
        toppings: {
          include: { topping: true },
          orderBy: { topping: { name: 'asc' } },
        },
      },
    });
    if (!product) throw notFound();
    return {
      ...productSummary(product),
      sizes: product.sizes.map(({ size }) => ({
        code: size.code,
        priceDelta: size.priceDelta,
      })),
      toppings: product.toppings.map(({ topping }) => ({
        id: topping.id,
        name: topping.name,
        price: topping.price,
      })),
    };
  }
}
