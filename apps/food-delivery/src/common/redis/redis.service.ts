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

  async del(key: string) {
    return this.redis.del(key);
  }
}
