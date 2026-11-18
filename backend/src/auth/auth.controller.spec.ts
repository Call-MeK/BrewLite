import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaService } from '../database/prisma.service.js';
import { AuthController } from './auth.controller.js';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';

describe('AuthController HTTP contract', () => {
  let app: INestApplication;

  beforeAll(async () => {
    vi.stubEnv('JWT_SECRET', 'controller-test-secret-at-least-32-bytes');
    vi.stubEnv('JWT_EXPIRES_IN', '3600');
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        AuthGuard,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: async ({
                data,
              }: {
                data: { email: string; passwordHash: string };
              }) => ({
                id: '00000000-0000-4000-8000-000000000001',
                email: data.email,
                passwordHash: data.passwordHash,
                loyaltyPoints: 0,
              }),
            },
          },
        },
      ],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    vi.unstubAllEnvs();
  });

  it.each([
    { email: 'bad-email', password: 'password123' },
    { email: 'a@example.com', password: 'short' },
    { email: 'a@example.com', password: 'password123', loyaltyPoints: 100 },
    { email: 'a@example.com', password: 'é'.repeat(37) },
  ])(
    'rejects invalid or extra credentials at the HTTP boundary %#',
    async (body) => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(body)
        .expect(400);
    },
  );

  it('responds with 201 and the normalized safe user on registration', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: ' A@EXAMPLE.COM ', password: 'password123' })
      .expect(201);
    expect(response.body).toEqual({
      id: '00000000-0000-4000-8000-000000000001',
      email: 'a@example.com',
      loyaltyPoints: 0,
    });
  });

  it('protects the current-user route before accessing the database', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .expect(401);
    expect(response.body).toMatchObject({
      statusCode: 401,
      code: 'UNAUTHORIZED',
    });
  });
});
