/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MetricsInterceptor } from './common/interceptor/metrics.interceptor';
import { MetricService } from './module/metrics/metric.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.enableCors();
  const metricService = app.get(MetricService);
  app.useGlobalInterceptors(new MetricsInterceptor(metricService));
  app.useGlobalFilters(
    new (class {
      catch(exception: any, host: any) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = exception.getStatus?.() || 500;
        console.error('Exception thrown:', exception);
        response
          .status(status)
          .json({ message: exception.message || 'Internal server error' });
      }
    })(),
  );

  await app.listen(port);
  Logger.log(
    `🚀 Application running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
