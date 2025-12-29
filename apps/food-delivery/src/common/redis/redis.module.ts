import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { BullModule } from '@nestjs/bullmq';
import { Cache_QUEUE, CacheProcessor } from './cache.processor';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: Cache_QUEUE,
    }),
  ],
  providers: [RedisService, CacheProcessor],
  exports: [RedisService, BullModule],
})
export class RedisModule {}
