import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { RedisService } from '../../common/redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrderTask {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}
  private readonly logger = new Logger(OrderTask.name);
  private readonly lockKey = 'sync-inventory-lock';
  private readonly lockTTL = 60;
  private readonly serverId = process.env.SERVER_ID || 'unknown';

  @Interval(10 * 1000)
  async syncRedisToDb() {
    this.logger.debug(`Start inventory sync job for ${this.serverId}`);
    const lockAcquired = await this.redis.lock(
      this.lockKey,
      this.serverId,
      this.lockTTL,
    );
    if (!lockAcquired) {
      this.logger.debug(`Lock exists, skipping job on ${this.serverId}`);
      return;
    }

    try {
      // Lấy tất cả key inventory:* từ Redis
      const keys = await this.redis.keys('inventory:*');
      if (!keys.length) {
        this.logger.warn('No inventory keys found in Redis');
        return;
      }
      const pipeline = this.redis.pipeline();
      keys.forEach((key) => pipeline.get(key));
      const results = await pipeline.exec();
      if (!results) {
        this.logger.error('Pipeline execution returned null');
        return;
      }

      const itemIds: string[] = [];
      const inventories: number[] = [];
      keys.forEach((key, idx) => {
        const itemId = key.replace('inventory:', ''); // Extract UUID
        const inventory = parseInt(results[idx][1] as string) || 0;

        itemIds.push(itemId);
        inventories.push(inventory);
      });

      // sysnc redis to database

      const row = await this.prisma.$executeRawUnsafe(`
        UPDATE "menu_items"
        SET
          inventory = data.new_inventory,
          available = CASE
            WHEN data.new_inventory > 0 THEN true
            ELSE false
          END
        FROM (
          SELECT
            unnest(ARRAY[${itemIds.map((id) => `'${id}'::uuid`).join(',')}]) AS id,
            unnest(ARRAY[${inventories.join(',')}]) AS new_inventory
        ) AS data
        WHERE "menu_items".id = data.id;
      `);

      this.logger.debug(
        `Inventory sync completed for ${keys.length} products and number row affected ${row}`,
      );
    } catch (err) {
      this.logger.error('Error syncing inventory', err);
    } finally {
      const currentLock = await this.redis.get(this.lockKey);
      if (currentLock === this.serverId) {
        await this.redis.del([this.lockKey]);
        this.logger.debug(`Lock released by ${this.serverId}`);
      }
    }
  }
}
