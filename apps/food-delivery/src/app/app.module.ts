import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../module/prisma/prisma.module';
import { AuthModule } from '../module/auth/auth.module';
import { UserModule } from '../module/user/user.module';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { RedisModule } from '../common/redis/redis.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../module/auth/guard/jwt-auth.guard';
import { RestaurantModule } from '../module/restaurant/restaurant.module';

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
      }),
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    UserModule,
    RestaurantModule
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
