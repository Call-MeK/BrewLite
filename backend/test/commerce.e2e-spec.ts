import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { SignJWT } from 'jose';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApplication } from '../src/common/configure-app.js';
import { MockPaymentGateway } from '../src/payments/mock-payment.gateway.js';
import { OrdersService } from '../src/orders/orders.service.js';
import type { CreateOrderDto } from '../src/orders/order.dto.js';

const productId = '00000000-0000-4000-8000-000000000001';
const prisma = new PrismaClient();

describe('Documented commerce APIs (PostgreSQL)', () => {
  let app: INestApplication;
  let token: string;
  let otherToken: string;
  let userId: string;
  const payload = {
    items: [{ productId, sizeCode: 'M', toppingIds: [], quantity: 1 }],
    expectedSubtotal: 35000,
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    configureApplication(app);
    await app.init();
    for (const other of [false, true]) {
      const user = await prisma.user.create({
        data: {
          email: `${randomUUID()}@example.com`,
          passwordHash: 'unused-test-hash',
        },
      });
      const jwt = await new SignJWT({})
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(user.id)
        .setIssuer('brewlite')
        .setAudience('brewlite-web')
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(new TextEncoder().encode(process.env.JWT_SECRET));
      if (other) otherToken = jwt;
      else {
        token = jwt;
        userId = user.id;
      }
    }
  });
  afterAll(async () => {
    await app?.close();
    await prisma.$disconnect();
  });
  beforeEach(async () => {
    vi.restoreAllMocks();
    await prisma.product.update({
      where: { id: productId },
      data: { stock: 20, basePrice: 30000, version: { increment: 1 } },
    });
  });

  function create(
    body: CreateOrderDto = payload,
    key = randomUUID(),
    bearer = token,
  ) {
    return request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${bearer}`)
      .set('Idempotency-Key', key)
      .send(body);
  }
  function pay(
    orderId: string,
    key = randomUUID(),
    method = 'WALLET',
    bearer = token,
  ) {
    return request(app.getHttpServer())
      .post('/payments')
      .set('Authorization', `Bearer ${bearer}`)
      .set('Idempotency-Key', key)
      .send({ orderId, method });
  }

  it('creates PENDING orders with authoritative price and stock snapshots', async () => {
    const result = await create();
    expect(result.status).toBe(201);
    expect(result.body).toMatchObject({
      userId,
      status: 'PENDING',
      inventoryStatus: 'RESERVED',
      subtotal: 35000,
      discount: 0,
      total: 35000,
      items: [
        {
          productId,
          productName: 'Espresso',
          sizeCode: 'M',
          quantity: 1,
          unitPrice: 35000,
          lineTotal: 35000,
        },
      ],
    });
    expect(
      (await prisma.product.findUniqueOrThrow({ where: { id: productId } }))
        .stock,
    ).toBe(19);
  });

  it('requires JWT and a UUID idempotency key before mutation', async () => {
    await request(app.getHttpServer())
      .post('/orders')
      .send(payload)
      .expect(401);
    await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(400);
    await request(app.getHttpServer())
      .post('/payments')
      .send({ orderId: randomUUID(), method: 'CARD' })
      .expect(401);
  });

  it('rejects invalid options, quantities, extra trusted fields, and changed prices atomically', async () => {
    const count = await prisma.order.count();
    expect(
      (await create({ ...payload, expectedSubtotal: 1 })).body,
    ).toMatchObject({
      statusCode: 409,
      code: 'PRICE_CHANGED',
      subtotal: 35000,
    });
    await create({
      ...payload,
      items: [{ ...payload.items[0], sizeCode: 'XL' }],
    }).expect(400);
    await create({
      ...payload,
      items: [{ ...payload.items[0], quantity: 0 }],
    }).expect(400);
    await create({ ...payload, userId: randomUUID() } as typeof payload).expect(
      400,
    );
    expect(await prisma.order.count()).toBe(count);
    expect(
      (await prisma.product.findUniqueOrThrow({ where: { id: productId } }))
        .stock,
    ).toBe(20);
  });

  it('replays equal concurrent order keys once and rejects conflicting payloads', async () => {
    const key = randomUUID();
    const [first, second] = await Promise.all([
      create(payload, key),
      create(payload, key),
    ]);
    expect([first.status, second.status]).toEqual([201, 201]);
    expect(first.body).toEqual(second.body);
    expect(
      await prisma.order.count({
        where: { userId, creationIdempotencyKey: key },
      }),
    ).toBe(1);
    await create({ ...payload, expectedSubtotal: 35001 }, key).expect(409);
    expect(
      (await prisma.product.findUniqueOrThrow({ where: { id: productId } }))
        .stock,
    ).toBe(19);
  });

  it('allows only one reservation when two customers race for the final item', async () => {
    await prisma.product.update({
      where: { id: productId },
      data: { stock: 1 },
    });
    const responses = await Promise.all([
      create(),
      create(payload, randomUUID(), otherToken),
    ]);
    expect(
      responses.map((response) => response.status).sort((a, b) => a - b),
    ).toEqual([201, 409]);
    expect(
      (await prisma.product.findUniqueOrThrow({ where: { id: productId } }))
        .stock,
    ).toBe(0);
  });

  it.each(['WALLET', 'CARD'])(
    'charges authoritative total and earns loyalty once for %s',
    async (method) => {
      const order = (await create()).body;
      const key = randomUUID();
      const [first, second] = await Promise.all([
        pay(order.id, key, method),
        pay(order.id, key, method),
      ]);
      expect([first.status, second.status]).toEqual([201, 201]);
      expect(first.body).toEqual(second.body);
      expect(first.body).toMatchObject({
        orderId: order.id,
        amount: 35000,
        method,
        status: 'SUCCEEDED',
        orderStatus: 'PAID',
      });
      expect(
        await prisma.loyaltyTransaction.count({
          where: { orderId: order.id, kind: 'EARN' },
        }),
      ).toBe(1);
      expect(
        (
          await prisma.loyaltyTransaction.findFirstOrThrow({
            where: { orderId: order.id },
          })
        ).points,
      ).toBe(3);
      await pay(order.id).expect(409);
      expect(
        (await prisma.product.findUniqueOrThrow({ where: { id: productId } }))
          .stock,
      ).toBe(19);
    },
  );

  it('serializes different payment keys for one order', async () => {
    const order = (await create()).body;
    const responses = await Promise.all([pay(order.id), pay(order.id)]);
    expect(
      responses.map((response) => response.status).sort((a, b) => a - b),
    ).toEqual([201, 409]);
    expect(
      await prisma.payment.count({
        where: { orderId: order.id, status: 'SUCCEEDED' },
      }),
    ).toBe(1);
  });

  it('applies promotion snapshots and rejects invalid vouchers without reserving stock', async () => {
    const body = {
      ...payload,
      items: [{ ...payload.items[0], quantity: 2 }],
      expectedSubtotal: 70000,
      voucherCode: 'BREW10K',
    };
    const order = await create(body);
    expect(order.status).toBe(201);
    expect(order.body).toMatchObject({
      subtotal: 70000,
      discount: 10000,
      total: 60000,
      voucherCode: 'BREW10K',
    });
    const stock = (
      await prisma.product.findUniqueOrThrow({ where: { id: productId } })
    ).stock;
    await create({ ...body, voucherCode: 'INVALID' }).expect(422);
    expect(
      (await prisma.product.findUniqueOrThrow({ where: { id: productId } }))
        .stock,
    ).toBe(stock);
  });

  it('protects history and makes unknown and unowned orders indistinguishable', async () => {
    const order = (await create()).body;
    await request(app.getHttpServer()).get('/orders/me').expect(401);
    const history = await request(app.getHttpServer())
      .get('/orders/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(
      history.body.some((entry: { id: string }) => entry.id === order.id),
    ).toBe(true);
    const owned = await request(app.getHttpServer())
      .get(`/orders/${order.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(owned.body.id).toBe(order.id);
    const foreign = await request(app.getHttpServer())
      .get(`/orders/${order.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404);
    const unknown = await request(app.getHttpServer())
      .get(`/orders/${randomUUID()}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404);
    expect(foreign.body).toEqual(unknown.body);
    await pay(order.id, randomUUID(), 'CARD', otherToken).expect(404);
  });

  it('releases a failed payment once and retries the same order with a new payment key', async () => {
    const order = (await create()).body;
    vi.spyOn(app.get(MockPaymentGateway), 'charge').mockReturnValueOnce(
      'FAILED',
    );
    const failedKey = randomUUID();
    const failed = await pay(order.id, failedKey);
    expect(failed.body).toMatchObject({
      status: 'FAILED',
      orderStatus: 'PAYMENT_FAILED',
    });
    expect(
      (await prisma.product.findUniqueOrThrow({ where: { id: productId } }))
        .stock,
    ).toBe(20);
    expect(
      await prisma.loyaltyTransaction.count({ where: { orderId: order.id } }),
    ).toBe(0);
    expect((await pay(order.id, failedKey)).body).toEqual(failed.body);
    expect(
      (await prisma.product.findUniqueOrThrow({ where: { id: productId } }))
        .stock,
    ).toBe(20);
    const paid = await pay(order.id);
    expect(paid.body).toMatchObject({
      orderId: order.id,
      status: 'SUCCEEDED',
      orderStatus: 'PAID',
    });
    expect(
      (await prisma.product.findUniqueOrThrow({ where: { id: productId } }))
        .stock,
    ).toBe(19);
    expect(await prisma.order.count({ where: { id: order.id } })).toBe(1);
  });

  it('does not partially reserve stock or create a payment when retry stock is insufficient', async () => {
    const order = (await create()).body;
    vi.spyOn(app.get(MockPaymentGateway), 'charge').mockReturnValueOnce(
      'FAILED',
    );
    await pay(order.id).expect(201);
    await prisma.product.update({
      where: { id: productId },
      data: { stock: 0, version: { increment: 1 } },
    });
    const retry = await pay(order.id);
    expect(retry.status).toBe(409);
    expect(retry.body.code).toBe('OUT_OF_STOCK');
    expect(
      (await prisma.order.findUniqueOrThrow({ where: { id: order.id } }))
        .status,
    ).toBe('PAYMENT_FAILED');
    expect(await prisma.payment.count({ where: { orderId: order.id } })).toBe(
      1,
    );
  });

  it('keeps catalogue and promotion snapshots stable and replays the original creation result', async () => {
    const key = randomUUID();
    const created = await create(payload, key);
    await prisma.product.update({
      where: { id: productId },
      data: {
        name: 'Renamed espresso',
        basePrice: 99000,
        version: { increment: 1 },
      },
    });
    expect((await create(payload, key)).body).toEqual(created.body);
    const payment = await pay(created.body.id);
    expect(payment.body.amount).toBe(35000);
    expect((await create(payload, key)).body).toEqual(created.body);
    const detail = await request(app.getHttpServer())
      .get(`/orders/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(detail.body.items[0].productName).toBe('Espresso');
    await prisma.product.update({
      where: { id: productId },
      data: { name: 'Espresso' },
    });
  });

  it('refunds mock payment, stock, and stored loyalty exactly once on internal cancellation', async () => {
    const order = (await create()).body;
    await pay(order.id).expect(201);
    const before = (
      await prisma.user.findUniqueOrThrow({ where: { id: userId } })
    ).loyaltyPoints;
    const orders = app.get(OrdersService);
    await orders.transitionOrder(order.id, 'CANCELLED');
    await orders.transitionOrder(order.id, 'CANCELLED');
    expect(
      (await prisma.product.findUniqueOrThrow({ where: { id: productId } }))
        .stock,
    ).toBe(20);
    expect(
      (await prisma.user.findUniqueOrThrow({ where: { id: userId } }))
        .loyaltyPoints,
    ).toBe(before - 3);
    expect(
      await prisma.loyaltyTransaction.count({ where: { orderId: order.id } }),
    ).toBe(2);
    expect(
      (await prisma.payment.findFirstOrThrow({ where: { orderId: order.id } }))
        .status,
    ).toBe('REFUNDED');
    await pay(order.id).expect(409);
    await request(app.getHttpServer())
      .post(`/orders/${order.id}/cancel`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('supports staff preparation flow and blocks cancellation after preparation', async () => {
    const order = (await create()).body;
    await pay(order.id).expect(201);
    const orders = app.get(OrdersService);
    await orders.transitionOrder(order.id, 'PREPARING');
    await expect(
      orders.transitionOrder(order.id, 'CANCELLED'),
    ).rejects.toThrow();
    await orders.transitionOrder(order.id, 'READY');
    await orders.transitionOrder(order.id, 'COMPLETED');
    expect((await orders.getOrderById(userId, order.id)).status).toBe(
      'COMPLETED',
    );
    await expect(orders.transitionOrder(order.id, 'PENDING')).rejects.toThrow();
  });

  it('rejects null voucher and client-controlled payment fields safely', async () => {
    await create({
      ...payload,
      voucherCode: null,
    } as unknown as typeof payload).expect(400);
    const order = (await create()).body;
    await request(app.getHttpServer())
      .post('/payments')
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', randomUUID())
      .send({ orderId: order.id, method: 'CARD', amount: 1, success: true })
      .expect(400);
    await pay(order.id, randomUUID(), 'CASH').expect(400);
  });
});
