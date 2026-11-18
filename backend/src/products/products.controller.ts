import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ProductsService } from './products.service.js';

@Controller('products')
export class ProductsController {
  constructor(
    @Inject(ProductsService) private readonly products: ProductsService,
  ) {}

  @Get()
  getProducts() {
    return this.products.getProducts();
  }

  @Get(':id')
  getProductById(@Param('id') id: string) {
    return this.products.getProductById(id);
  }
}
