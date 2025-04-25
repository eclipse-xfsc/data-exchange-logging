import { InjectQueue, Process, Processor } from '@nestjs/bull';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import { Job, Queue } from 'bull';
import { DeepPartial } from 'typeorm';
import { InboxNotification } from '../entities/inbox-notification.entity';
import { WebHook, WebHookStatus } from '../entities/webhook.entity';
import {
  WebHookQueryParams,
  WebHookRepository,
} from '../repository/webhook.repository';

type WebHookJobData = {
  notification: InboxNotification;
  webHook: WebHook;
};

@Injectable()
@Processor('{webhook-queue}')
export class WebHookService {
  constructor(
    private readonly webHookRepository: WebHookRepository,
    @InjectQueue('{webhook-queue}')
    private readonly queue: Queue<WebHookJobData>
  ) {}

  async createWebHook(webHook: DeepPartial<WebHook>) {
    try {
      return await this.webHookRepository.save({
        ...webHook,
        status: WebHookStatus.ACTIVE,
      });
    } catch (e: any) {
      if (
        e.message ===
        'duplicate key value violates unique constraint "webhook_config"'
      ) {
        throw new BadRequestException('Webhook already exists');
      }
      throw e;
    }
  }

  async updateWebHook(
    webHookId: string,
    participantId: string,
    webHookDto: DeepPartial<WebHook>
  ) {
    const webHook = await this.webHookRepository.getEntity(webHookId);
    if (!webHook || webHook.participantId !== participantId) {
      throw new NotFoundException(`Webhook with id ${webHookId} not found`);
    }
    return this.webHookRepository.save({
      ...webHook,
      ...webHookDto,
      participantId,
    });
  }

  async disableWebHook(webHookId: string, participantId: string) {
    return this.updateWebHook(webHookId, participantId, {
      status: WebHookStatus.INACTIVE,
    });
  }

  async paginateWebHooks(participantId: string, query: WebHookQueryParams) {
    return this.webHookRepository.paginate({
      ...query,
      participantId,
    });
  }

  async notifyProvider(notification: InboxNotification, webHook: WebHook) {
    const response = await axios.request({
      method: webHook.method,
      url: webHook.url,
      data: notification,
      headers: {
        'Content-Type': 'application/json',
        ...webHook.headers,
      },
    });
    return response.status === 200;
  }

  async addToQueue(notification: InboxNotification) {
    const webHooks = await this.webHookRepository.findContractWebHooks(
      notification.contract,
      notification.sender
    );
    return Promise.all(
      webHooks.map((webHook) =>
        this.queue.add(
          { notification, webHook },
          {
            attempts: 10,
            backoff: {
              type: 'exponential',
              delay: 5000,
            },
          }
        )
      )
    );
  }

  @Process()
  async process(job: Job<WebHookJobData>) {
    const result = await this.notifyProvider(
      job.data.notification,
      job.data.webHook
    );
    if (!result) {
      throw new Error('Notification failed. Retrying...');
    }
  }
}
