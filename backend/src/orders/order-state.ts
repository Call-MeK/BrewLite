import { OrderStatus } from '@prisma/client';
import { apiError } from '../common/api-error.js';

const transitions: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING: ['PAID', 'PAYMENT_FAILED', 'CANCELLED'],
  PAYMENT_FAILED: ['PENDING', 'CANCELLED'],
  PAID: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY'],
  READY: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

export function assertTransition(from: OrderStatus, to: OrderStatus) {
  if (!transitions[from].includes(to)) {
    throw apiError(
      409,
      'INVALID_ORDER_STATE',
      `Cannot change order from ${from} to ${to}.`,
    );
  }
}
