import { PrismaClient } from '@prisma/client';

export async function seed(prisma: PrismaClient) {
  for (const [code, priceDelta] of [
    ['S', 0],
    ['M', 5000],
    ['L', 10000],
  ] as const) {
    await prisma.sizeOption.upsert({
      where: { code },
      create: { code, priceDelta },
      update: {},
    });
  }
  const toppings = [
    {
      id: '00000000-0000-4000-8000-000000000101',
      name: 'Vanilla syrup',
      price: 5000,
    },
    {
      id: '00000000-0000-4000-8000-000000000102',
      name: 'Extra espresso shot',
      price: 10000,
    },
  ];
  for (const topping of toppings) {
    await prisma.topping.upsert({
      where: { id: topping.id },
      create: topping,
      update: {},
    });
  }
  const products = [
    {
      id: '00000000-0000-4000-8000-000000000001',
      name: 'Espresso',
      description: 'Rich & bold',
      basePrice: 30000,
      stock: 20,
      imageUrl:
        'https://images.unsplash.com/photo-1502462041640-b3d7e50d0662?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: '00000000-0000-4000-8000-000000000002',
      name: 'Flat white',
      description: 'Smooth & balanced',
      basePrice: 45000,
      stock: 20,
      imageUrl:
        'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: '00000000-0000-4000-8000-000000000003',
      name: 'Cappuccino',
      description: 'Soft & velvety',
      basePrice: 45000,
      stock: 20,
      imageUrl:
        'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: '00000000-0000-4000-8000-000000000004',
      name: 'Iced latte',
      description: 'Cool & creamy',
      basePrice: 50000,
      stock: 0,
      imageUrl:
        'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=400&q=80',
    },
  ];
  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: {
        ...product,
        sizes: { create: ['S', 'M', 'L'].map((sizeCode) => ({ sizeCode })) },
        toppings: { create: toppings.map(({ id }) => ({ toppingId: id })) },
      },
    });
  }
  await prisma.promotion.upsert({
    where: { code: 'BREW10K' },
    update: {},
    create: {
      code: 'BREW10K',
      amount: 10000,
      minOrderValue: 50000,
      isActive: true,
      validFrom: new Date('2026-01-01T00:00:00Z'),
      expiresAt: new Date('2099-01-01T00:00:00Z'),
    },
  });
}

// Upserts preserve existing stock, prices, and promotion configuration on reruns.
if (
  process.argv[1]?.replaceAll('\\', '/').endsWith('/prisma/seed.ts') ||
  process.argv[1] === 'prisma/seed.ts'
) {
  const prisma = new PrismaClient();
  try {
    await seed(prisma);
  } finally {
    await prisma.$disconnect();
  }
}
