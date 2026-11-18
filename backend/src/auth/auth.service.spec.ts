import { HttpException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { jwtVerify } from 'jose';
import { PrismaService } from '../database/prisma.service.js';
import { AuthService } from './auth.service.js';

const userId = '00000000-0000-4000-8000-000000000001';
const secret = 'test-secret-with-at-least-32-bytes-long';
const safeUser = { id: userId, email: 'a@example.com', loyaltyPoints: 12 };

describe('AuthService', () => {
  beforeEach(() => {
    vi.stubEnv('JWT_SECRET', secret);
    vi.stubEnv('JWT_EXPIRES_IN', '120');
  });
  afterEach(() => vi.unstubAllEnvs());

  it('normalizes email, stores a real bcrypt hash, and returns only public fields', async () => {
    let stored: { email: string; passwordHash: string } | undefined;
    const database = {
      user: {
        create: async ({
          data,
        }: {
          data: { email: string; passwordHash: string };
        }) => {
          stored = data;
          return {
            ...safeUser,
            email: data.email,
            passwordHash: data.passwordHash,
          };
        },
      },
    } as unknown as PrismaService;

    const result = await new AuthService(database).register({
      email: ' A@Example.COM ',
      password: 'my-password-123',
    });

    expect(result).toEqual(safeUser);
    expect(stored?.email).toBe('a@example.com');
    expect(stored?.passwordHash).toMatch(/^\$2[aby]\$10\$/);
    expect(await compare('my-password-123', stored!.passwordHash)).toBe(true);
    expect(await compare('wrong-password', stored!.passwordHash)).toBe(false);
  });

  it('maps duplicate email constraints to a safe 409 response', async () => {
    const database = {
      user: {
        create: async () => {
          throw new Prisma.PrismaClientKnownRequestError('database internals', {
            code: 'P2002',
            clientVersion: '6.19.0',
          });
        },
      },
    } as unknown as PrismaService;
    try {
      await new AuthService(database).register({
        email: 'a@example.com',
        password: 'password123',
      });
      expect.fail('Expected duplicate registration to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(409);
      expect((error as HttpException).getResponse()).toMatchObject({
        statusCode: 409,
        code: 'EMAIL_ALREADY_EXISTS',
      });
      expect(
        JSON.stringify((error as HttpException).getResponse()),
      ).not.toContain('database internals');
    }
  });

  it('rejects passwords beyond bcrypt 72-byte boundary before any database work', async () => {
    const database = {} as PrismaService;
    await expect(
      new AuthService(database).register({
        email: 'a@example.com',
        password: 'é'.repeat(37),
      }),
    ).rejects.toMatchObject({
      response: { statusCode: 400, code: 'VALIDATION_ERROR' },
    });
  });

  it('issues a verifiable JWT with the configured lifetime and a safe user', async () => {
    const passwordHash = await hash('password123', 10);
    const database = {
      user: {
        findUnique: async ({ where }: { where: { email: string } }) =>
          where.email === 'a@example.com'
            ? { ...safeUser, passwordHash }
            : null,
      },
    } as unknown as PrismaService;
    const result = await new AuthService(database).login({
      email: ' A@Example.COM ',
      password: 'password123',
    });
    expect(result).toMatchObject({
      tokenType: 'Bearer',
      expiresIn: 120,
      user: safeUser,
    });
    expect(result.user).not.toHaveProperty('passwordHash');
    const { payload, protectedHeader } = await jwtVerify(
      result.accessToken,
      new TextEncoder().encode(secret),
      {
        algorithms: ['HS256'],
        issuer: 'brewlite',
        audience: 'brewlite-web',
      },
    );
    expect(protectedHeader.alg).toBe('HS256');
    expect(payload.sub).toBe(userId);
    expect(payload.exp! - payload.iat!).toBe(120);
    expect(payload).not.toHaveProperty('passwordHash');
  });

  it('rejects a wrong password and nonexistent email with the same safe error', async () => {
    const passwordHash = await hash('password123', 10);
    const database = {
      user: {
        findUnique: async ({ where }: { where: { email: string } }) =>
          where.email === 'a@example.com'
            ? { ...safeUser, passwordHash }
            : null,
      },
    } as unknown as PrismaService;
    const service = new AuthService(database);
    const errors = await Promise.all(
      ['a@example.com', 'missing@example.com'].map(async (email) => {
        try {
          await service.login({ email, password: 'wrong-password' });
          expect.fail('Expected login to fail');
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          return (error as HttpException).getResponse();
        }
      }),
    );
    expect(errors[0]).toMatchObject({ statusCode: 401, code: 'UNAUTHORIZED' });
    expect(errors[0]).toEqual(errors[1]);
  });

  it('reads the current user from the database and never returns a password hash', async () => {
    const database = {
      user: {
        findUnique: async () => ({ ...safeUser, passwordHash: 'private' }),
      },
    } as unknown as PrismaService;
    expect(await new AuthService(database).getCurrentUser(userId)).toEqual(
      safeUser,
    );
  });

  it('rejects a user deleted after the token was issued', async () => {
    const database = {
      user: { findUnique: async () => null },
    } as unknown as PrismaService;
    await expect(
      new AuthService(database).getCurrentUser(userId),
    ).rejects.toMatchObject({
      response: { statusCode: 401, code: 'UNAUTHORIZED' },
    });
  });

  it.each(['', 'too-short'])(
    'fails startup with an unsafe JWT secret: %s',
    (value) => {
      vi.stubEnv('JWT_SECRET', value);
      expect(() => new AuthService({} as PrismaService)).toThrow('JWT_SECRET');
    },
  );

  it.each(['0', '-1', '1.5', 'abc', 'Infinity'])(
    'fails startup with invalid token lifetime: %s',
    (value) => {
      vi.stubEnv('JWT_EXPIRES_IN', value);
      expect(() => new AuthService({} as PrismaService)).toThrow(
        'JWT_EXPIRES_IN',
      );
    },
  );

  it('defaults the token lifetime to 3600 seconds', async () => {
    vi.stubEnv('JWT_EXPIRES_IN', undefined);
    const passwordHash = await hash('password123', 10);
    const database = {
      user: { findUnique: async () => ({ ...safeUser, passwordHash }) },
    } as unknown as PrismaService;
    expect(
      (
        await new AuthService(database).login({
          email: 'a@example.com',
          password: 'password123',
        })
      ).expiresIn,
    ).toBe(3600);
  });
});
