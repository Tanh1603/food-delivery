import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  Counter,
  Gauge,
  Histogram,
  register,
  exponentialBuckets,
} from 'prom-client';

@Injectable()
export class MetricService implements OnModuleInit {
  // HTTP Request Duration - để đo latency
  private readonly httpRequestDuration: Histogram<string>;

  // HTTP Request Total - để đo throughput
  private readonly httpRequestTotal: Counter<string>;

  // Active Requests - để đo concurrent load
  private readonly activeRequests: Gauge<string>;

  // CPU & Memory metrics
  private readonly cpuUsage: Gauge<string>;
  private readonly memoryUsage: Gauge<string>;

  constructor() {
    const labelNames = ['server_id'];
    // Track request duration (latency)
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_ms',
      help: 'Duration of HTTP requests in milliseconds',
      labelNames: ['method', 'route', 'status_code', 'server_id'],
      buckets: exponentialBuckets(10, 1.5, 20), // Latency buckets
    });

    // Track total requests (throughput)
    this.httpRequestTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code', 'server_id'],
    });

    // Track active requests (concurrent load)
    this.activeRequests = new Gauge({
      name: 'http_active_requests',
      help: 'Number of active HTTP requests',
      labelNames: labelNames,
    });

    this.cpuUsage = new Gauge({
      name: 'cpu_usage_percent',
      help: 'CPU usage percent of the process',
      labelNames: labelNames,
    });

    this.memoryUsage = new Gauge({
      name: 'memory_usage_bytes',
      help: 'Memory usage of the process in bytes',
      labelNames: labelNames,
    });
  }
  onModuleInit() {
    // Cập nhật CPU và Memory usage mỗi 10 giây
    setInterval(() => {
      this.updateResourceUsage();
    }, 10000);
  }

  /**
   * Record a completed HTTP request
   */
  recordRequest(
    method: string,
    route: string,
    statusCode: number,
    durationMs: number,
  ) {
    const serverId = process.env.SERVER_ID || 'unknown';

    // Record duration (latency)
    this.httpRequestDuration
      .labels(method, route, String(statusCode), serverId)
      .observe(durationMs);

    // Increment counter (throughput)
    this.httpRequestTotal
      .labels(method, route, String(statusCode), serverId)
      .inc();

    // Log for debugging
    Logger.log(
      `[${serverId}] ${method} ${route} - ${durationMs}ms - ${statusCode}`,
    );
  }
  private lastCpuUsage = process.cpuUsage();
  private lastTime = Date.now();

  updateResourceUsage() {
    const serverId = process.env.SERVER_ID || 'unknown';

    const currentCpu = process.cpuUsage(this.lastCpuUsage);
    const currentTime = Date.now();

    const elapsedMs = currentTime - this.lastTime;

    // CPU dùng trong khoảng thời gian này (microseconds)
    const cpuUsedMicros = currentCpu.user + currentCpu.system;

    // Số core
    const numCores = require('os').cpus().length;

    // % CPU
    const cpuPercent = (cpuUsedMicros / 1000 / (elapsedMs * numCores)) * 100;

    this.cpuUsage.labels(serverId).set(cpuPercent);

    // Memory RSS
    const memoryUsed = process.memoryUsage().rss;
    this.memoryUsage.labels(serverId).set(memoryUsed);

    // update snapshot
    this.lastCpuUsage = process.cpuUsage();
    this.lastTime = currentTime;
  }

  incrementActiveRequests() {
    const serverId = process.env.SERVER_ID || 'unknown';
    this.activeRequests.labels(serverId).inc();
  }

  /**
   * Decrement active requests
   */
  decrementActiveRequests() {
    const serverId = process.env.SERVER_ID || 'unknown';
    this.activeRequests.labels(serverId).dec();
  }

  /**
   * Get all metrics in Prometheus format
   */
  async getMetrics(): Promise<string> {
    return register.metrics();
  }

  /**
   * Get metrics as JSON (for analysis)
   */
  async getMetricsJSON() {
    const metrics = await register.getMetricsAsJSON();
    return {
      server_id: process.env.SERVER_ID || 'unknown',
      timestamp: new Date().toISOString(),
      metrics,
    };
  }
}
