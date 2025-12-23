import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @IsUUID()
  restaurantId: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsString()
  phone: string;

  @IsString()
  deliveryAddress: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsString()
  idempotencyKey: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
