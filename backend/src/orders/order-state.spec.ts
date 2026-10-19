import { OrderStatus } from '@prisma/client';
import { assertTransition } from './order-state.js';

describe('documented order state machine', () => {
  const allowed = new Set([
    'PENDING:PAID',
    'PENDING:PAYMENT_FAILED',
    'PENDING:CANCELLED',
    'PAYMENT_FAILED:PENDING',
    'PAYMENT_FAILED:CANCELLED',
    'PAID:PREPARING',
    'PAID:CANCELLED',
    'PREPARING:READY',
    'READY:COMPLETED',
  ]);
  for (const from of Object.values(OrderStatus)) {
    for (const to of Object.values(OrderStatus)) {
      it(`${from} -> ${to} is ${allowed.has(`${from}:${to}`) ? 'allowed' : 'blocked'}`, () => {
        const transition = () => assertTransition(from, to);
        if (allowed.has(`${from}:${to}`)) expect(transition).not.toThrow();
        else expect(transition).toThrow();
      });
    }
  }
});
