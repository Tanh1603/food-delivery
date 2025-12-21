import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // ------------------- Health Check -------------------
  healthCheck(path: string): {
    status: string;
    uptime: number;
    timestamp: string;
    path: string;
  } {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      path,
    };
  }
}
