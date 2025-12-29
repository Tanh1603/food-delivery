// src/initializers/app.initializer.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../module/prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';

@Injectable()
export class AppInitializer {
  private readonly logger = new Logger(AppInitializer.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async initialize() {
    this.logger.log('🔧 Initializing application...');

    try {
      // Database health check
      await this.prisma.$queryRaw`SELECT 1`;
      this.logger.log('✅ Database connected');
    } catch (error) {
      this.logger.error('❌ Initialization failed', error.stack);
      throw error;
    }
  }
}
