// src/health/prisma.health.indicator.ts
import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { HealthIndicatorSession } from '@nestjs/terminus/dist/health-indicator/health-indicator.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaHealthIndicator {
  constructor(
    private prisma: PrismaService,
    private healthIndicatorService: HealthIndicatorService,
  ) {}

  async check(key: string): Promise<HealthIndicatorSession> {
    const session = this.healthIndicatorService.check(key);
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      session.up(); // mark healthy
    } catch (err) {
      session.down({ message: err.message });
    }
    return session;
  }
}
