import { BadRequestException, Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { OnEvent } from '../../common/decorators/on-event.decorator';
import { LogIntegrityCron } from '../../inbox/crons/log-integrity.cron';
import { InboxNotificationRepository } from '../../inbox/repository/inbox-notifications.repository';
import { InboxNotificationsIntegrityProcessor } from '../../inbox/services/inbox-notification-integrity.processor';
import { NotificationIntegrityService } from '../../inbox/services/notifications-integrity.service';

@Injectable()
export class AdminLogIntegrityService {
  private events = new Subject();
  constructor(
    private readonly inboxNotificationRepository: InboxNotificationRepository,
    private readonly processor: InboxNotificationsIntegrityProcessor,
    private readonly cron: LogIntegrityCron,
    private readonly integrityService: NotificationIntegrityService
  ) {}

  @OnEvent('INTEGRITY_CHECK_UPDATE')
  async onIntegrityCheckEvent(event) {
    this.events.next({
      data: event,
    });
  }

  async getIntegrityCheckOverview() {
    const count = await this.inboxNotificationRepository.getVerifiedCount();
    return {
      count,
      lastJob: await this.processor.getLastRunJobInformation(),
      isRunning: await this.processor.isRunning(),
      isPaused: await this.processor.isPaused(),
      cron: await this.cron.getCronInformation(),
    };
  }

  async startIntegrityCheck() {
    if (await this.processor.isRunning()) {
      throw new BadRequestException('Integrity check is already running');
    }
    await this.processor.addJob({
      page: 1,
    });
    return true;
  }

  async verifyNotification(notificationId: string) {
    const notification = await this.inboxNotificationRepository.getEntity(
      notificationId
    );
    if (!notification) {
      throw new BadRequestException('Notification not found');
    }
    return this.integrityService.verifyNotification(notification);
  }

  async resumeIntegrityCheck() {
    return this.processor.resumeQueue();
  }

  async pauseIntegrityCheck() {
    return this.processor.pauseQueue();
  }

  sendEvents() {
    return this.events.asObservable();
  }
}
