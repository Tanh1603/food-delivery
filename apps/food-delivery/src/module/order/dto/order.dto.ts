import { Prisma } from '../../../../generated/prisma/client';
import { OrderStatus } from './../../../../generated/prisma/enums';

export class OrderDto {
  id: string;
  restaurantId: string;
  userId: string;
  phone: string;
  deliveryAddress: string;
  note?: string | null;
  status: OrderStatus;
  total: number;
  createdAt: Date;
  updatedAt: Date;

  itemsValue: Prisma.JsonValue;
}
