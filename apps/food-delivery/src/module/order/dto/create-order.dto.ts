import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from './create-order-item.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty()
  @IsUUID()
  restaurantId: string;

  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  deliveryAddress: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  note?: string;

  @IsString()
  @ApiProperty()
  idempotencyKey: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @ApiProperty({
    type: [CreateOrderItemDto],
  })
  items: CreateOrderItemDto[];
}
