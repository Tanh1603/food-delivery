import { Controller, Get, Header } from '@nestjs/common';
import { MetricService } from './metric.service';
import { Public } from '../../common/decorator/public.decorator';

@Controller('metrics')
export class MetricController {
  constructor(private readonly metricService: MetricService) {}

  /**
   * Prometheus scrape endpoint
   * Format: text/plain (Prometheus format)
   */
  @Get()
  @Public()
  @Header('Content-Type', 'text/plain')
  async getMetrics() {
    return this.metricService.getMetrics();
  }

  /**
   * JSON metrics endpoint (for custom analysis)
   */
  @Get('json')
  @Public()
  async getMetricsJSON() {
    return this.metricService.getMetricsJSON();
  }
}
