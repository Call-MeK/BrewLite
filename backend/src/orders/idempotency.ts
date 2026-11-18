import { createHash } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { isUUID } from 'class-validator';
import { apiError } from '../common/api-error.js';

export function requireIdempotencyKey(key: string | undefined) {
  if (!key || !isUUID(key))
    throw apiError(400, 'VALIDATION_ERROR', 'Idempotency-Key must be a UUID.');
  return key.toLowerCase();
}

export function requestHash(payload: unknown) {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

export async function lockIdempotency(
  tx: Prisma.TransactionClient,
  userId: string,
  operation: 'orders' | 'payments',
  key: string,
) {
  // Transaction-scoped PostgreSQL locks also serialize requests across API processes.
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`${userId}:${operation}:${key}`}, 0))::text`;
}

export function verifyRequestHash(actual: string, expected: string) {
  if (actual !== expected)
    throw apiError(
      409,
      'IDEMPOTENCY_CONFLICT',
      'This key was already used with different request data.',
    );
}
