import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  HealthCheckService,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
  HealthCheck,
} from '@nestjs/terminus';
import { Public } from '../../common/decorator/public.decorator';

@Controller('health')
@Public()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private prismaService: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    const diskPath = process.platform === 'win32' ? 'C:\\' : '/';
    return this.health.check([
      async () => this.prismaHealth.pingCheck('database', this.prismaService), // DB
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // heap <= 150MB
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024), // RSS <= 300MB
      () =>
        this.disk.checkStorage('disk', {
          path: diskPath,
          thresholdPercent: 0.9,
        }), // disk 90%
    ]);
  }

  @Get('ready')
  ready() {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('live')
  live() {
    return { status: 'alive', timestamp: new Date().toISOString() };
  }

  @Get('info')
  info() {
    return {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
    };
  }
}
