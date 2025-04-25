import { CacheModule, Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { GlobalExceptionFilter } from './exceptions/global.exception-filter';
import { LoggerProvider } from './logs/logger.provider';
import { ValidationExceptionFilter } from './exceptions/validation.exception-filter';
import { BullModule } from '@nestjs/bull';
import { ConfigType } from '../config/config.module';
import { EventEmitter } from './events/event-emitter';
import { ServiceUnavailableFilter } from './exceptions/service-unavailable.exception-filter';
import { IoRedisStore } from '@tirke/node-cache-manager-ioredis';

export const GLOBAL_CRON_QUEUE = '{global-cron-queue}';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: GLOBAL_CRON_QUEUE,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<ConfigType>) => {
        const config = configService.get('server.throtller', { infer: true });
        return {
          ...config,
          store: 'memory',
        };
      },
    }),
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<ConfigType>) => {
        const cacheConfig = {
          ...configService.get('general.cache', { infer: true }),
          isGlobal: true,
        };

        if (cacheConfig.store === 'redis') {
          const { type, host, port, password, nodes, options, prefix } =
            configService.get('redis', { infer: true });
          if (type === 'cluster') {
            return {
              ...cacheConfig,
              store: IoRedisStore as any,
              clusterConfig: {
                nodes,
                options,
              },
            };
          }
          return {
            ...cacheConfig,
            host,
            port,
            password,
            store: IoRedisStore as any,
            keyPrefix: prefix,
          };
        }

        return cacheConfig;
      },
    }),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ServiceUnavailableFilter,
    },
    EventEmitter,
    LoggerProvider,
    Logger,
  ],
  exports: [CacheModule, BullModule, Logger, EventEmitter],
})
export class GlobalModule {}
