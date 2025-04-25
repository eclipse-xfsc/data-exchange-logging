import { BullModule } from '@nestjs/bull';
import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from '../admin/admin.module';
import { AuthModule } from '../auth/auth.module';
import { GlobalModule } from '../global/global.module';
import { AbstractCAMAdapter } from './adapters';
import { CamAdapter } from './adapters/cam.adapter';
import { InboxNotificationsController } from './controllers/inbox-notification.controller';
import { WebHookController } from './controllers/webhook.controller';
import { LogIntegrityCron } from './crons/log-integrity.cron';
import { LogPruningCron } from './crons/log-prun.cron';
import { InboxNotification } from './entities/inbox-notification.entity';
import { WebHook } from './entities/webhook.entity';
import { CamGateway } from './gateways/cam.gateway';
import { TrustServiceGateway } from './gateways/trust-service.gateway';
import { InboxNotificationRepository } from './repository/inbox-notifications.repository';
import { WebHookRepository } from './repository/webhook.repository';
import { CamRepotingProcessor } from './services/cam-reporting.processor';
import { CamReportingService } from './services/cam-reporting.service';
import { InboxDataConsumer } from './services/inbox-consumer.processor';
import { InboxNotificationsIntegrityProcessor } from './services/inbox-notification-integrity.processor';
import { InboxNotificationsService } from './services/inbox-notifications.service';
import { InboxDataProvider } from './services/inbox-provider.processor';
import { NotificationIntegrityService } from './services/notifications-integrity.service';
import { WebHookService } from './services/webhook.service';
import {
  DIDTrustServiceGateway,
  VerifiableCredentialModule,
} from '@gaia-x/gaia-x-vc';
import { RdfBodyParserMiddleware } from '../global/middlewares/rdf.parser.middleware';

@Module({
  imports: [
    GlobalModule,
    BullModule.registerQueue(
      {
        name: '{notifications}',
        settings: {
          maxStalledCount: 0,
          lockDuration: 60000,
          lockRenewTime: 15000,
        },
      },
      {
        name: '{integrity-queue}',
        settings: {
          maxStalledCount: 0,
          lockDuration: 60000,
          lockRenewTime: 15000,
        },
      },
      {
        name: '{cam-report-queue}',
      },
      {
        name: '{webhook-queue}',
      }
    ),
    TypeOrmModule.forFeature([InboxNotification, WebHook]),
    forwardRef(() => AdminModule),
    AuthModule,
    VerifiableCredentialModule.registerAsync({
      imports: [InboxNotificationsModule],
      inject: [TrustServiceGateway],
      useFactory: (didTrustServiceGateway: DIDTrustServiceGateway) => {
        return { didTrustServiceGateway };
      },
    }),
  ],
  providers: [
    InboxNotificationRepository,
    InboxNotificationsService,
    NotificationIntegrityService,
    TrustServiceGateway,
    InboxDataConsumer,
    InboxDataProvider,
    LogPruningCron,
    LogIntegrityCron,
    InboxNotificationsIntegrityProcessor,
    CamGateway,
    CamRepotingProcessor,
    CamReportingService,
    {
      provide: AbstractCAMAdapter,
      useClass: CamAdapter,
    },
    WebHookRepository,
    WebHookService,
  ],
  controllers: [InboxNotificationsController, WebHookController],
  exports: [
    InboxNotificationsService,
    BullModule,
    InboxNotificationRepository,
    InboxNotificationsIntegrityProcessor,
    LogIntegrityCron,
    NotificationIntegrityService,
    TrustServiceGateway,
  ],
})
export class InboxNotificationsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RdfBodyParserMiddleware)
      .forRoutes(InboxNotificationsController);
  }
}
