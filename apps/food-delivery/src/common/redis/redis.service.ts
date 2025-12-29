import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private redis: Redis;

  onModuleInit() {
    this.redis = new Redis(process.env.REDIS_URL);
  }

  async set(key: string, value: string, ttlSeconds: number) {
    await this.redis.set(key, value, 'EX', ttlSeconds);
  }

  async get(key: string) {
    return this.redis.get(key);
  }

  async del(key: string[]) {
    return this.redis.del(key);
  }

  async delByPrefix(prefix: string) {
    const stream = this.redis.scanStream({
      match: `${prefix}*`,
      count: 100,
    });

    for await (const keys of stream) {
      if (keys.length) {
        await this.redis.del(...keys);
      }
    }
  }

  // Atomic decrement inventory

  async decrementInventory(key: string, qty: number): Promise<boolean> {
    const stock = await this.redis.get(key);
    if (stock === null) throw new Error(`Inventory key ${key} not found`);

    if (parseInt(stock) < qty) return false; // không đủ stock

    await this.redis.decrby(key, qty);
    return true;
  }

  async decrementInventoryBatch(
    items: { key: string; quantity: number }[],
  ): Promise<boolean> {
    if (items.length === 0) return true;

    const pipeline = this.redis.pipeline();

    // 1. đọc tất cả stock trước
    const values = await this.redis.mget(items.map((i) => i.key));

    for (let i = 0; i < items.length; i++) {
      const stock = parseInt(values[i] ?? '0', 10);
      if (stock < items[i].quantity) {
        return false;
      }
    }

    for (const item of items) {
      pipeline.decrby(item.key, item.quantity);
    }

    await pipeline.exec();
    return true;
  }

  /** Optional: Increment inventory (rollback or cancel order) */
  async incrementInventory(key: string, qty: number) {
    await this.redis.incrby(key, qty);
  }

  async incrementInventoryBatch(items: { key: string; quantity: number }[]) {
    if (items.length === 0) return;

    const pipeline = this.redis.pipeline();
    for (const item of items) {
      pipeline.incrby(item.key, item.quantity);
    }
    await pipeline.exec();
  }

  /** Load initial inventory from DB */
  async loadInventoryFromDB(items: { id: string; quantity: number }[]) {
    if (!items.length) return;

    const pipeline = this.redis.pipeline();
    for (const item of items) {
      pipeline.set(`inventory:${item.id}`, item.quantity);
    }
    await pipeline.exec();
  }
}
