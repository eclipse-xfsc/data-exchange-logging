import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InboxNotificationsService } from './inbox-notifications.service';
import { JobData } from './inbox-provider.processor';
import { WebHookService } from './webhook.service';

@Processor('{notifications}')
export class InboxDataConsumer {
  public constructor(
    private readonly logger: Logger,
    private readonly inboxService: InboxNotificationsService,
    private readonly webHookService: WebHookService
  ) {}

  @Process('process-notification')
  async handleProcessNotification(job: Job<JobData>) {
    this.logger.debug(
      'Start processing notification...',
      job.id,
      job.attemptsMade
    );
    try {
      const notification = await this.inboxService.create(
        job.id as string,
        job.data.notification
      );
      await this.webHookService.addToQueue(notification);
    } catch (e) {
      this.logger.error(e.message);
      throw e;
    }
    this.logger.debug('Processing notification complete', job.id);
  }
}
