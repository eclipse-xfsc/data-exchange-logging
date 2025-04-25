import { SignatureService } from '@gaia-x/gaia-x-vc';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';

import { InboxNotification } from '../entities/inbox-notification.entity';
import { InboxNotificationsService } from './inbox-notifications.service';

@Injectable()
export class NotificationIntegrityService {
  public constructor(
    private readonly notificationService: InboxNotificationsService,
    private readonly logger: Logger,
    private readonly signatureService: SignatureService,
    @InjectQueue('{cam-report-queue}') private readonly camQueue: Queue
  ) {}

  async verifyNotification(notification: InboxNotification) {
    try {
      const veriableCrendetial = JSON.parse(notification.verifiableCrendetial);
      const { verified } = await this.signatureService.verifyCredential(
        veriableCrendetial
      );
      if (verified) {
        return this.notificationService.updateNotification(notification.id, {
          ...notification,
          verifiedAt: new Date(),
        } as InboxNotification);
      }
    } catch (e) {
      this.logger.error(`Error verifying notification ${notification.id}`, e);
    }
    await this.camQueue.add({
      id: notification.id,
    });
    return notification;
  }
}
