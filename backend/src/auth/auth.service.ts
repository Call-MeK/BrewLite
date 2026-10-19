import { HttpException, Inject, Injectable } from '@nestjs/common';
import { Prisma, type User } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { isUUID } from 'class-validator';
import { jwtVerify, SignJWT } from 'jose';
import { PrismaService } from '../database/prisma.service.js';
import type { CredentialsDto } from './credentials.dto.js';

const publicUserSelect = {
  id: true,
  email: true,
  loyaltyPoints: true,
} as const;
// Keep the missing-user branch on the same bcrypt work factor as a real login.
const dummyPasswordHash =
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.';

function publicUser(user: Pick<User, 'id' | 'email' | 'loyaltyPoints'>) {
  return { id: user.id, email: user.email, loyaltyPoints: user.loyaltyPoints };
}

function unauthorized() {
  return new HttpException(
    {
      statusCode: 401,
      code: 'UNAUTHORIZED',
      message: 'Invalid authentication credentials',
    },
    401,
  );
}

@Injectable()
export class AuthService {
  private readonly signingKey: Uint8Array;
  private readonly expiresIn: number;

  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {
    const secret = process.env.JWT_SECRET;
    if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
      throw new Error('JWT_SECRET must contain at least 32 bytes');
    }
    const lifetime = process.env.JWT_EXPIRES_IN ?? '3600';
    this.expiresIn = Number(lifetime);
    if (!/^[1-9]\d*$/.test(lifetime) || !Number.isSafeInteger(this.expiresIn)) {
      throw new Error(
        'JWT_EXPIRES_IN must be a positive integer number of seconds',
      );
    }
    this.signingKey = new TextEncoder().encode(secret);
  }

  async register(credentials: CredentialsDto) {
    this.validatePasswordLength(credentials.password);
    const email = credentials.email.trim().toLowerCase();
    const passwordHash = await hash(credentials.password, 10);
    try {
      const user = await this.prisma.user.create({
        data: { email, passwordHash },
        select: publicUserSelect,
      });
      return publicUser(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new HttpException(
          {
            statusCode: 409,
            code: 'EMAIL_ALREADY_EXISTS',
            message: 'Email is already registered',
          },
          409,
        );
      }
      throw error;
    }
  }

  async login(credentials: CredentialsDto) {
    this.validatePasswordLength(credentials.password);
    const user = await this.prisma.user.findUnique({
      where: { email: credentials.email.trim().toLowerCase() },
    });
    const passwordMatches = await compare(
      credentials.password,
      user?.passwordHash ?? dummyPasswordHash,
    );
    if (!user || !passwordMatches) throw unauthorized();
    const issuedAt = Math.floor(Date.now() / 1000);
    const accessToken = await new SignJWT({})
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setSubject(user.id)
      .setIssuer('brewlite')
      .setAudience('brewlite-web')
      .setIssuedAt(issuedAt)
      .setExpirationTime(issuedAt + this.expiresIn)
      .sign(this.signingKey);
    return {
      accessToken,
      tokenType: 'Bearer' as const,
      expiresIn: this.expiresIn,
      user: publicUser(user),
    };
  }

  async getCurrentUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });
    if (!user) throw unauthorized();
    return publicUser(user);
  }

  async verifyToken(token: string): Promise<{ id: string }> {
    try {
      const { payload } = await jwtVerify(token, this.signingKey, {
        algorithms: ['HS256'],
        issuer: 'brewlite',
        audience: 'brewlite-web',
        requiredClaims: ['sub', 'exp', 'iat'],
      });
      if (typeof payload.sub !== 'string' || !isUUID(payload.sub))
        throw unauthorized();
      return { id: payload.sub };
    } catch {
      throw unauthorized();
    }
  }

  private validatePasswordLength(password: string) {
    if (Buffer.byteLength(password, 'utf8') > 72) {
      throw new HttpException(
        {
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          message: 'Password must not exceed 72 UTF-8 bytes',
        },
        400,
      );
    }
  }
}
