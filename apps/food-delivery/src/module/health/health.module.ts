import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [TerminusModule.forRoot()],
  controllers: [HealthController],
  providers: [],
  exports: [],
})
export class HealthModule {}
