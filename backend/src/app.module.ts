import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/prisma.service.js';
import { AuthModule } from './auth/auth.module.js';
import { ProductsModule } from './products/products.module.js';
import { HealthModule } from './health/health.module.js';
import { CommerceModule } from './orders/commerce.module.js';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    ProductsModule,
    HealthModule,
    CommerceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
