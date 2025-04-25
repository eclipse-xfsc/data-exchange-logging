import { InjectQueue } from '@nestjs/bull';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { LogToken } from '../../auth/gateways/dct.gateway';
import { CreateInboxNotificationDto } from '../dtos/create-inbox-notification.dto';
import { InboxNotificationDto } from '../dtos/inbox-notification.dto';
import { InboxNotificationRepository } from '../repository/inbox-notifications.repository';

export type JobData = {
  notification: CreateInboxNotificationDto;
};

@Injectable()
export class InboxDataProvider {
  public constructor(
    protected notificationRepository: InboxNotificationRepository,
    @InjectQueue('{notifications}')
    private readonly notificationsQueue: Queue<JobData>
  ) {}

  async sendToQueue(
    logToken: LogToken,
    notification: CreateInboxNotificationDto,
    { trackId }: { trackId: string }
  ): Promise<void> {
    if (logToken.sub !== notification.credentialSubject.sender) {
      throw new ForbiddenException('Sender does not match log token');
    }
    await this.notificationsQueue.add(
      'process-notification',
      {
        notification,
      },
      {
        attempts: 3,
        jobId: trackId,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      }
    );
  }
}
