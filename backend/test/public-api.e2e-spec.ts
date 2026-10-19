import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { jwtVerify, SignJWT } from 'jose';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApplication } from '../src/common/configure-app.js';

const prisma = new PrismaClient();
const productId = '00000000-0000-4000-8000-000000000001';

describe('Public API and auth contracts (PostgreSQL)', () => {
  let app: INestApplication;
  let user: { id: string; email: string; loyaltyPoints: number };
  const password = 'my-password-123';

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    configureApplication(app);
    await app.init();
    user = await prisma.user.create({
      data: {
        email: `${randomUUID()}@example.com`,
        passwordHash: await hash(password, 10),
      },
      select: { id: true, email: true, loyaltyPoints: true },
    });
  });

  afterAll(async () => {
    await app?.close();
    await prisma.$disconnect();
  });

  it('registers a normalized email, stores bcrypt, and returns only the safe user', async () => {
    const email = `${randomUUID()}@example.com`;
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: ` ${email.toUpperCase()} `, password })
      .expect(201);
    expect(response.body).toEqual({
      id: expect.any(String),
      email,
      loyaltyPoints: 0,
    });
    const stored = await prisma.user.findUniqueOrThrow({ where: { email } });
    expect(stored.id).toBe(response.body.id);
    expect(stored.passwordHash).toMatch(/^\$2[aby]\$10\$/);
    expect(await compare(password, stored.passwordHash)).toBe(true);
    expect(response.body).not.toHaveProperty('accessToken');
    expect(response.body).not.toHaveProperty('passwordHash');
  });

  it('rejects duplicate normalized emails without adding another user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: ` ${user.email.toUpperCase()} `, password })
      .expect(409);
    expect(response.body).toMatchObject({
      statusCode: 409,
      code: 'EMAIL_ALREADY_EXISTS',
    });
    expect(await prisma.user.count({ where: { email: user.email } })).toBe(1);
    expect(JSON.stringify(response.body)).not.toContain('passwordHash');
  });

  it.each([
    { email: 'invalid', password },
    { email: 123, password },
    { email: 'a@example.com', password: 'short' },
    { email: 'a@example.com', password: 12345678 },
    { email: 'a@example.com', password: 'é'.repeat(37) },
    { email: 'a@example.com', password, loyaltyPoints: 999 },
    {},
  ])(
    'rejects malformed registration or trusted extra fields %#',
    async (body) => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(body)
        .expect(400);
      expect(response.body).toMatchObject({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
      });
    },
  );

  it('logs in with normalized email and returns a verifiable expiring JWT and current user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: ` ${user.email.toUpperCase()} `, password })
      .expect(200);
    expect(response.body).toMatchObject({
      tokenType: 'Bearer',
      expiresIn: Number(process.env.JWT_EXPIRES_IN ?? 3600),
      user,
    });
    expect(response.body.user).toEqual(user);
    const { payload } = await jwtVerify(
      response.body.accessToken,
      new TextEncoder().encode(process.env.JWT_SECRET),
      {
        algorithms: ['HS256'],
        issuer: 'brewlite',
        audience: 'brewlite-web',
      },
    );
    expect(payload.sub).toBe(user.id);
    expect(payload.exp! - payload.iat!).toBe(response.body.expiresIn);
    const current = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${response.body.accessToken}`)
      .expect(200);
    expect(current.body).toEqual(user);
  });

  it('does not reveal whether a failed login email exists', async () => {
    const wrongPassword = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: 'wrong-password' })
      .expect(401);
    const missingEmail = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `${randomUUID()}@example.com`,
        password: 'wrong-password',
      })
      .expect(401);
    expect(wrongPassword.body).toEqual(missingEmail.body);
    expect(wrongPassword.body).toMatchObject({
      statusCode: 401,
      code: 'UNAUTHORIZED',
    });
    expect(wrongPassword.body).not.toHaveProperty('accessToken');
  });

  it('rejects login DTO fields that could override server-controlled behavior', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password, expiresIn: 999999 })
      .expect(400);
    expect(response.body).toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
    });
  });

  it('rejects missing authentication, expired tokens, and tampered signatures', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
    const signingKey = new TextEncoder().encode(process.env.JWT_SECRET);
    const expired = await new SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuer('brewlite')
      .setAudience('brewlite-web')
      .setIssuedAt()
      .setExpirationTime('-1s')
      .sign(signingKey);
    const valid = await new SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuer('brewlite')
      .setAudience('brewlite-web')
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(signingKey);
    const parts = valid.split('.');
    parts[2] = (parts[2][0] === 'a' ? 'b' : 'a') + parts[2].slice(1);
    for (const token of [expired, parts.join('.')]) {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
      expect(response.body).toMatchObject({
        statusCode: 401,
        code: 'UNAUTHORIZED',
      });
      expect(response.body).not.toHaveProperty('user');
    }
  });

  it('returns the public catalogue including sold out products and availability', async () => {
    const response = await request(app.getHttpServer())
      .get('/products')
      .expect(200);
    expect(response.body).toHaveLength(4);
    expect(
      response.body.map((product: { name: string }) => product.name),
    ).toEqual(['Cappuccino', 'Espresso', 'Flat white', 'Iced latte']);
    expect(response.body).toContainEqual({
      id: '00000000-0000-4000-8000-000000000004',
      name: 'Iced latte',
      description: 'Cool & creamy',
      basePrice: 50000,
      stock: 0,
      isAvailable: false,
      imageUrl: expect.any(String),
    });
    for (const product of response.body) {
      expect(Number.isInteger(product.basePrice)).toBe(true);
      expect(product.isAvailable).toBe(product.stock > 0);
      expect(product).not.toHaveProperty('version');
    }
  });

  it('returns only configured size and topping options for a product', async () => {
    const response = await request(app.getHttpServer())
      .get(`/products/${productId}`)
      .expect(200);
    expect(response.body).toMatchObject({
      id: productId,
      name: 'Espresso',
      description: 'Rich & bold',
    });
    expect(response.body.sizes).toHaveLength(3);
    expect(response.body.sizes).toEqual(
      expect.arrayContaining([
        { code: 'S', priceDelta: 0 },
        { code: 'M', priceDelta: 5000 },
        { code: 'L', priceDelta: 10000 },
      ]),
    );
    expect(response.body.toppings).toHaveLength(2);
    expect(response.body.toppings).toEqual(
      expect.arrayContaining([
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
      ]),
    );
  });

  it('returns the same safe 404 for nonexistent and malformed product ids', async () => {
    const missing = await request(app.getHttpServer())
      .get(`/products/${randomUUID()}`)
      .expect(404);
    const malformed = await request(app.getHttpServer())
      .get('/products/not-a-uuid')
      .expect(404);
    expect(malformed.body).toEqual(missing.body);
    expect(malformed.body).toMatchObject({
      statusCode: 404,
      code: 'PRODUCT_NOT_FOUND',
    });
  });

  it('reports database readiness through the public health endpoint', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);
    expect(response.body).toEqual({ status: 'ok', database: 'up' });
  });

  it('allows browser preflight for authenticated idempotent requests', async () => {
    const origin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000';
    const response = await request(app.getHttpServer())
      .options('/orders')
      .set('Origin', origin)
      .set('Access-Control-Request-Method', 'POST')
      .set(
        'Access-Control-Request-Headers',
        'Content-Type, Authorization, Idempotency-Key',
      )
      .expect(204);
    expect(response.headers['access-control-allow-origin']).toBe(origin);
    expect(
      response.headers['access-control-allow-methods'].split(','),
    ).toContain('POST');
    const headers = response.headers['access-control-allow-headers']
      .toLowerCase()
      .split(',')
      .map((header: string) => header.trim());
    expect(headers).toEqual(
      expect.arrayContaining([
        'content-type',
        'authorization',
        'idempotency-key',
      ]),
    );
  });
});
