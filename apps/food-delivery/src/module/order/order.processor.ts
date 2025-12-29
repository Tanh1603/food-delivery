import {
  InjectQueue,
  OnWorkerEvent,
  Processor,
  WorkerHost,
} from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { OrderStatus } from '../../../generated/prisma/enums';
import { Cache_QUEUE, CacheJobName } from '../../common/redis/cache.processor';
import { RedisService } from '../../common/redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';

export const ORDER_QUEUE = 'order-queue';
export enum OrderJobName {
  CREATE = 'create',
}

@Processor(ORDER_QUEUE, { concurrency: 10 })
export class OrderProcessor extends WorkerHost {
  private logger = new Logger(OrderProcessor.name);

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    @InjectQueue(Cache_QUEUE) private cacheQueue: Queue,
  ) {
    super();
  }

  async process(
    job: Job<{ orderId: string; itemIds: string[]; quantities: number[] }>,
  ) {
    switch (job.name) {
      case OrderJobName.CREATE:
        await this.handleOrderJob(job);
        break;
      default:
        break;
    }
  }

  handleOrderJob = async (
    job: Job<{ orderId: string; itemIds: string[]; quantities: number[] }>,
  ) => {
    const { orderId, itemIds, quantities } = job.data;
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
      });
      if (!order || order.status !== OrderStatus.PENDING) return;
      await this.prisma.$executeRaw`
            UPDATE "menu_items"
            SET inventory = inventory - data.qty
            FROM (
              SELECT unnest(${itemIds}::uuid[]) AS id,
                     unnest(${quantities}::int[]) AS qty
            ) AS data
            WHERE "menu_items".id = data.id
              AND inventory >= data.qty
          `;
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CONFIRMED,
        },
      });
      await this.cacheQueue.add(
        CacheJobName.CLEAR_CACHE,
        { key: 'orders:' },
        {
          attempts: 5,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  };

  @OnWorkerEvent('failed')
  async onFailed(
    job: Job<{ orderId: string; itemIds: string[]; quantities: number[] }>,
  ) {
    if (job.attemptsMade < job.opts.attempts) return;

    const { orderId, itemIds, quantities } = job.data;

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.status !== OrderStatus.PENDING) return;

    const storedItems: { key: string; quantity: number }[] = [];
    for (const item of order.itemsValue as unknown as {
      menuItemId: string;
      quantity: number;
      price: number;
      name: string;
    }[]) {
      storedItems.push({
        key: `inventory:${item.menuItemId}`,
        quantity: item.quantity,
      });
    }

    await this.redisService.incrementInventoryBatch(storedItems);

    await this.prisma.$executeRaw`
          UPDATE "menu_items"
          SET
            inventory = inventory + data.qty,
            available = true
          FROM (
            SELECT
              unnest(${itemIds}::uuid[]) AS id,
              unnest(${quantities}::int[]) AS qty
          ) AS data
          WHERE "menu_items".id = data.id
      `;
    await this.prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.CANCELLED },
    });
  }
}
