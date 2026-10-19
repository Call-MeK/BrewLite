import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard.js';
import { CreateOrderDto } from './order.dto.js';
import { OrdersService } from './orders.service.js';

@Controller('orders')
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(@Inject(OrdersService) private readonly orders: OrdersService) {}

  @Post()
  createOrder(
    @Req() request: Request & { user: { id: string } },
    @Body() dto: CreateOrderDto,
    @Headers('idempotency-key') key: string | undefined,
  ) {
    return this.orders.createOrder(request.user.id, dto, key);
  }

  @Get('me')
  getMyOrders(@Req() request: Request & { user: { id: string } }) {
    return this.orders.getMyOrders(request.user.id);
  }

  @Get(':id')
  getOrderById(
    @Req() request: Request & { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.orders.getOrderById(request.user.id, id);
  }
}
