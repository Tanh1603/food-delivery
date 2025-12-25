import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import Joi from 'joi';
import { RedisModule } from '../common/redis/redis.module';
import { AuthModule } from '../module/auth/auth.module';
import { JwtAuthGuard } from '../module/auth/guard/jwt-auth.guard';
import { HealthModule } from '../module/health/health.module';
import { MetricModule } from '../module/metrics/metric.module';
import { OrderModule } from '../module/order/order.module';
import { PrismaModule } from '../module/prisma/prisma.module';
import { RestaurantModule } from '../module/restaurant/restaurant.module';
import { UserModule } from '../module/user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
        PORT: Joi.number().port().default(3000),
        DATABASE_URL: Joi.string().uri().required(),
        JWT_SECRET_KEY: Joi.string().min(32).required(),
        JWT_EXPIRES_IN: Joi.string().required(),
        REDIS_URL: Joi.string().required(),
        SERVER_ID: Joi.string().required(),
      }),
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    UserModule,
    OrderModule,
    MetricModule,
    RestaurantModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
