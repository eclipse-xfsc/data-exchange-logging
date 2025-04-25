import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as passport from 'passport';
import { AuthModule } from '../auth/auth.module';
import { AdminStrategy } from '../auth/strategies/admin.strategy';
import { EventEmitter } from '../global/events/event-emitter';
import { InboxNotificationsModule } from '../inbox/inbox-notifications.module';
import { BackupsController } from './controllers/backup.controller';
import { LogIntegrityController } from './controllers/log-integrity.controller';
import { LogsController } from './controllers/logs.controller';
import { SettingsController } from './controllers/settings.controller';
import { Setting } from './entities/setting.entity';
import { SettingsRepository } from './repositories/settings.repository';
import { AdminLogIntegrityService } from './services/admin-log-integrity.service';
import { AdminLogService } from './services/admin-logs.service';
import { BackupsService } from './services/backup.service';
import { BullMonitorService } from './services/bull-monitor.service';
import { SettingsService } from './services/settings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Setting]),
    forwardRef(() => InboxNotificationsModule),
    forwardRef(() => AuthModule),
  ],
  providers: [
    SettingsRepository,
    {
      provide: SettingsService,
      useFactory: async (
        repository: SettingsRepository,
        configService: ConfigService,
        eventEmitter: EventEmitter
      ) => {
        const service = new SettingsService(
          repository,
          configService,
          eventEmitter
        );
        await service.seed();
        return service;
      },
      inject: [SettingsRepository, ConfigService, EventEmitter],
    },
    BullMonitorService,
    AdminLogIntegrityService,
    AdminLogService,
    BackupsService,
  ],
  exports: [SettingsService],
  controllers: [
    SettingsController,
    LogIntegrityController,
    LogsController,
    BackupsController,
  ],
})
export class AdminModule implements NestModule {
  constructor(
    private monitor: BullMonitorService,
    private strategy: AdminStrategy
  ) {}
  async configure(consumer: MiddlewareConsumer) {
    await this.monitor.init();

    consumer
      .apply(
        passport.authenticate(this.strategy, {
          session: false,
          failureRedirect: '/login?redirect=/api/bull-monitor',
        }),
        this.monitor.router
      )
      .forRoutes('/bull-monitor');
  }
}
