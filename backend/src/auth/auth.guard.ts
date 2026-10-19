import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service.js';

export type AuthenticatedRequest = Request & { user: { id: string } };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const match = /^Bearer ([^\s]+)$/i.exec(
      request.headers.authorization ?? '',
    );
    if (!match) {
      throw new HttpException(
        {
          statusCode: 401,
          code: 'UNAUTHORIZED',
          message: 'Invalid authentication credentials',
        },
        401,
      );
    }
    request.user = await this.auth.verifyToken(match[1]);
    return true;
  }
}
