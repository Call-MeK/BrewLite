import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsIn,
  IsInt,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class CreateOrderItemDto {
  @IsUUID() productId: string;
  @IsIn(['S', 'M', 'L']) sizeCode: string;
  @IsArray()
  @ArrayMaxSize(100)
  @ArrayUnique()
  @IsUUID(undefined, { each: true })
  toppingIds: string[];
  @IsInt() @Min(1) @Max(2147483647) quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
  @IsInt() @Min(1) @Max(2147483647) expectedSubtotal: number;
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsString()
  @MaxLength(100)
  voucherCode?: string;
}

export class CreatePaymentDto {
  @IsUUID() orderId: string;
  @IsIn(['WALLET', 'CARD']) method: 'WALLET' | 'CARD';
}
