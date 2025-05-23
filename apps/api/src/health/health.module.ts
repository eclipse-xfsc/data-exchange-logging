import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { RedisHealthService } from './redis.health.service';

@Module({
  imports: [TerminusModule, HttpModule],
  providers: [RedisHealthService],
  controllers: [HealthController],
})
export class HealthModule {}
