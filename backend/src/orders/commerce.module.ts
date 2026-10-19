import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { PaymentsController } from '../payments/payments.controller.js';
import { PaymentsService } from '../payments/payments.service.js';
import { MockPaymentGateway } from '../payments/mock-payment.gateway.js';

@Module({
  imports: [AuthModule],
  controllers: [OrdersController, PaymentsController],
  providers: [OrdersService, PaymentsService, MockPaymentGateway],
  exports: [OrdersService, MockPaymentGateway],
})
export class CommerceModule {}
