import { PrismaService } from '../database/prisma.service.js';
import { ProductsService } from './products.service.js';

const product = {
  id: '00000000-0000-4000-8000-000000000001',
  name: 'Coffee',
  description: 'Fresh coffee',
  imageUrl: '/coffee.png',
  basePrice: 30000,
  stock: 0,
  version: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ProductsService', () => {
  it('returns sold out products and derives availability without exposing storage metadata', async () => {
    const database = {
      product: { findMany: async () => [product, { ...product, stock: 2 }] },
    } as unknown as PrismaService;
    expect(await new ProductsService(database).getProducts()).toEqual([
      {
        id: product.id,
        name: 'Coffee',
        description: 'Fresh coffee',
        imageUrl: '/coffee.png',
        basePrice: 30000,
        stock: 0,
        isAvailable: false,
      },
      {
        id: product.id,
        name: 'Coffee',
        description: 'Fresh coffee',
        imageUrl: '/coffee.png',
        basePrice: 30000,
        stock: 2,
        isAvailable: true,
      },
    ]);
  });

  it('flattens configured size and topping relations into public options', async () => {
    const database = {
      product: {
        findUnique: async () => ({
          ...product,
          sizes: [
            {
              productId: product.id,
              sizeCode: 'M',
              size: { code: 'M', priceDelta: 5000 },
            },
          ],
          toppings: [
            {
              productId: product.id,
              toppingId: '00000000-0000-4000-8000-000000000002',
              topping: {
                id: '00000000-0000-4000-8000-000000000002',
                name: 'Pearls',
                price: 7000,
              },
            },
          ],
        }),
      },
    } as unknown as PrismaService;
    expect(
      await new ProductsService(database).getProductById(product.id),
    ).toEqual({
      id: product.id,
      name: 'Coffee',
      description: 'Fresh coffee',
      imageUrl: '/coffee.png',
      basePrice: 30000,
      stock: 0,
      isAvailable: false,
      sizes: [{ code: 'M', priceDelta: 5000 }],
      toppings: [
        {
          id: '00000000-0000-4000-8000-000000000002',
          name: 'Pearls',
          price: 7000,
        },
      ],
    });
  });

  it('returns 404 for a missing product', async () => {
    const database = {
      product: { findUnique: async () => null },
    } as unknown as PrismaService;
    await expect(
      new ProductsService(database).getProductById(product.id),
    ).rejects.toMatchObject({
      response: { statusCode: 404, code: 'PRODUCT_NOT_FOUND' },
    });
  });

  it('returns 404 for a malformed UUID before calling PostgreSQL', async () => {
    await expect(
      new ProductsService({} as PrismaService).getProductById('not-a-uuid'),
    ).rejects.toMatchObject({
      response: { statusCode: 404, code: 'PRODUCT_NOT_FOUND' },
    });
  });
});
