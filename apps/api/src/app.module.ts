import { BullModule } from '@nestjs/bull';
import {
  ClassSerializerInterceptor,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { join } from 'path';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { AppConfigModule, ConfigType } from './config/config.module';
import { GlobalModule } from './global/global.module';
import { JsonBodyParserMiddleware } from './global/middlewares/json.parser.middleware';
import { HealthModule } from './health/health.module';
import { InboxNotificationsModule } from './inbox/inbox-notifications.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    AppConfigModule,
    GlobalModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'ui'), // "ui" is the folder where the UI application is builded
      exclude: ['/api*', '/bull-monitor*'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const options = config.get<TypeOrmModuleOptions>('database');
        return {
          ...options,
          autoLoadEntities: true,
          synchronize: true,
          // logging: true
        } as TypeOrmModuleOptions;
      },
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<ConfigType>) => {
        const {
          type,
          host,
          port,
          password,
          nodes,
          options: { keyPrefix, ...options },
        } = configService.get('redis', { infer: true });
        if (type === 'cluster') {
          return {
            createClient: () => {
              return new Redis.Cluster(nodes, options);
            },
          };
        }
        return {
          redis: {
            host,
            port: port,
            password,
          },
        };
      },
    }),
    AuthModule,
    AdminModule,
    InboxNotificationsModule,
    TerminusModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JsonBodyParserMiddleware).exclude('/inbox/*').forRoutes('*');
  }
}
