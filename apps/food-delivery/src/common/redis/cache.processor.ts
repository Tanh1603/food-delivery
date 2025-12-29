import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { RedisService } from './redis.service';

export const Cache_QUEUE = 'cache-queue';
export enum CacheJobName {
  CLEAR_CACHE = 'clear-cache',
}

@Processor(Cache_QUEUE, { concurrency: 10 })
export class CacheProcessor extends WorkerHost {
  constructor(private redisService: RedisService) {
    super();
  }

  async process(job: Job<{ key: string }>) {
    const { key } = job.data;
    switch (job.name) {
      case CacheJobName.CLEAR_CACHE:
        await this.handleJob(key);
        break;
      default:
        break;
    }
  }

  handleJob = async (key: string) => {
    await this.redisService.delByPrefix(key);
  };
}
