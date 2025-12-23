import { Request, Response } from 'express';
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, finalize, catchError } from 'rxjs/operators';
import { MetricService } from '../../module/metrics/metric.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const route = request.route?.path || request.url; // fallback nếu route chưa match
    const method = request.method;

    if (route === '/api/metrics') {
      return next.handle(); // skip metric cho route /metrics
    }

    const startTime = Date.now();
    this.metricsService.incrementActiveRequests();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;
          this.metricsService.recordRequest(
            method,
            route,
            statusCode,
            duration,
          );
        },
      }),
      catchError((err) => {
        const duration = Date.now() - startTime;
        const statusCode = err?.status || 500;
        this.metricsService.recordRequest(method, route, statusCode, duration);
        throw err;
      }),
      finalize(() => {
        this.metricsService.decrementActiveRequests();
      }),
    );
  }
}

