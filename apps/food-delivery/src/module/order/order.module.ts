import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { ORDER_QUEUE, OrderProcessor } from './order.processor';
import { OrderService } from './order.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: ORDER_QUEUE,
    }),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderProcessor],
})
export class OrderModule {}
