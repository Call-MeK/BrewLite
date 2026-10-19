import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
class ApiExceptionFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    if (error instanceof HttpException) {
      const statusCode = error.getStatus();
      const body = error.getResponse();
      const detail =
        typeof body === 'string'
          ? { message: body }
          : (body as Record<string, unknown>);
      // Health is a readiness payload rather than an application error envelope.
      if (detail.database === 'down') {
        response.status(statusCode).json(detail);
        return;
      }
      if (typeof detail.code !== 'string') {
        const codes: Record<number, string> = {
          400: 'VALIDATION_ERROR',
          401: 'UNAUTHORIZED',
          404: 'NOT_FOUND',
          413: 'PAYLOAD_TOO_LARGE',
        };
        response
          .status(statusCode)
          .json({
            statusCode,
            code: codes[statusCode] ?? 'HTTP_ERROR',
            message:
              statusCode === 404
                ? 'Resource not found.'
                : 'The request could not be processed.',
          });
        return;
      }
      response.status(statusCode).json({
        ...detail,
        statusCode,
      });
      return;
    }
    if (
      typeof error === 'object' &&
      error !== null &&
      'type' in error &&
      error.type === 'entity.too.large'
    ) {
      response
        .status(413)
        .json({
          statusCode: 413,
          code: 'PAYLOAD_TOO_LARGE',
          message: 'Request body exceeds the 100 KB limit.',
        });
      return;
    }
    const databaseError =
      error instanceof Prisma.PrismaClientInitializationError ||
      (error instanceof Prisma.PrismaClientKnownRequestError &&
        ['P1001', 'P1002', 'P1008', 'P1017', 'P2024'].includes(error.code));
    response.status(databaseError ? 503 : 500).json({
      statusCode: databaseError ? 503 : 500,
      code: databaseError ? 'DATABASE_UNAVAILABLE' : 'INTERNAL_ERROR',
      message: databaseError
        ? 'Database is unavailable. Please try again.'
        : 'An unexpected error occurred.',
    });
  }
}

export function configureApplication(app: INestApplication) {
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000',
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: () =>
        new BadRequestException({
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          message:
            'Request data is invalid. Check the required fields and values.',
        }),
    }),
  );
  app.useGlobalFilters(new ApiExceptionFilter());
}
