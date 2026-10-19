import { Injectable } from '@nestjs/common';

@Injectable()
export class MockPaymentGateway {
  private readonly result: 'SUCCEEDED' | 'FAILED';
  constructor() {
    const result = process.env.MOCK_PAYMENT_RESULT ?? 'SUCCEEDED';
    if (result !== 'SUCCEEDED' && result !== 'FAILED') {
      throw new Error('MOCK_PAYMENT_RESULT must be SUCCEEDED or FAILED');
    }
    this.result = result;
  }

  charge(): 'SUCCEEDED' | 'FAILED' {
    return this.result;
  }
}
