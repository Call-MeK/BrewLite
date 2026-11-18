import {
  Body,
  Controller,
  Headers,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard.js';
import { CreatePaymentDto } from '../orders/order.dto.js';
import { PaymentsService } from './payments.service.js';

@Controller('payments')
@UseGuards(AuthGuard)
export class PaymentsController {
  constructor(
    @Inject(PaymentsService) private readonly payments: PaymentsService,
  ) {}

  @Post()
  createPayment(
    @Req() request: Request & { user: { id: string } },
    @Body() dto: CreatePaymentDto,
    @Headers('idempotency-key') key: string | undefined,
  ) {
    return this.payments.createPayment(request.user.id, dto, key);
  }
}
