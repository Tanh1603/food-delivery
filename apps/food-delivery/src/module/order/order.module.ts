import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderTask } from './order.cron';
import { OrderService } from './order.service';

@Module({
  imports: [
    // BullModule.registerQueue({
    //   name: ORDER_QUEUE,
    // }),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderTask],
})
export class OrderModule {}
