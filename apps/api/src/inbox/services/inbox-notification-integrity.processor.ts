import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job, JobOptions, Queue } from 'bull';
import { pick } from 'lodash';
import { Optional } from 'utility-types';
import { promiseAllLimit } from '../../common/utils';
import { EventEmitter } from '../../global/events/event-emitter';
import { InboxNotificationRepository } from '../repository/inbox-notifications.repository';
import { NotificationIntegrityService } from './notifications-integrity.service';

export type NotificationIntegrityJobData = {
  page: number;
  pageSize: number;
  skipVerified?: boolean;
  skip?: number;
  processed: number;
  total: number;
};

const DEFAULT_LOG_BATCH_SIZE = 500;

@Processor('{integrity-queue}')
@Injectable()
export class InboxNotificationsIntegrityProcessor {
  public constructor(
    @InjectQueue('{integrity-queue}')
    private readonly queue: Queue<NotificationIntegrityJobData>,
    private readonly notificationRepository: InboxNotificationRepository,
    private readonly notificationIntegrityService: NotificationIntegrityService,
    private readonly eventEmitter: EventEmitter
  ) {
    queue.on('global:completed', async (jobId) => {
      const job = await queue.getJob(jobId);
      this.eventEmitter.emit('INTEGRITY_CHECK_UPDATE', job.data);
    });
    queue.on('stalled', (job) => {
      console.log('stalled', JSON.stringify(job));
    });
    queue.on('failed', (job, error) => {
      console.log('failed', JSON.stringify(job));
      console.log('failed error', JSON.stringify(error));
    });
  }

  @Process()
  async processIntegrity(job: Job<NotificationIntegrityJobData>) {
    const { items: notifications, count } =
      await this.notificationRepository.getVerifiableNotifications(job.data);
    let verifiedNotifications;
    try {
      verifiedNotifications = await promiseAllLimit(
        notifications.map(async (notification, index, array) => {
          const verifiedNotification =
            await this.notificationIntegrityService.verifyNotification(
              notification
            );
          await job.progress(Math.round((index / array.length) * 100));
          return verifiedNotification;
        }),
        15
      );
    } catch (e) {
      return job.moveToFailed(e);
    }
    const processed = job.data.processed + verifiedNotifications.length;
    await job.update({
      ...job.data,
      total: job.data.skipVerified
        ? processed + count - verifiedNotifications.length
        : count,
      processed,
    });
    const nextJobData = this.getNextJobData(
      job,
      count,
      verifiedNotifications.filter((notification) => !notification.verifiedAt)
        .length
    );
    if (nextJobData) {
      await this.addJob(nextJobData, {
        delay: 1,
      });
    }
    await job.progress(100);
  }

  public async addJob(
    skipVerified?: boolean
  ): Promise<Job<NotificationIntegrityJobData>>;
  public async addJob(
    params?: Optional<
      NotificationIntegrityJobData,
      'pageSize' | 'processed' | 'total'
    >,
    jobOptions?: JobOptions
  ): Promise<Job<NotificationIntegrityJobData>>;
  public async addJob(
    params?:
      | Optional<
          NotificationIntegrityJobData,
          'pageSize' | 'processed' | 'total'
        >
      | boolean,
    jobOptions?: JobOptions
  ): Promise<Job<NotificationIntegrityJobData>> {
    let data: NotificationIntegrityJobData = {
      page: 1,
      pageSize: DEFAULT_LOG_BATCH_SIZE,
      processed: 0,
      total: 0,
    };
    if (typeof params === 'boolean' && params) {
      if ((await this.getJobCount()) > 0) {
        throw new Error('There is already a job in the queue');
      }
      data = {
        ...data,
        skipVerified: true,
        skip: 0,
      };
    } else {
      data = {
        ...data,
        ...(params as NotificationIntegrityJobData),
      };
    }
    return this.queue.add(data, {
      ...jobOptions,
      attempts: 3,
      priority: 1,
    });
  }

  public async resumeQueue() {
    return this.queue.resume();
  }

  public async pauseQueue() {
    return this.queue.pause();
  }

  public async isPaused() {
    return this.queue.isPaused();
  }

  public async isRunning() {
    return (await this.getJobCount()) > 0;
  }

  public async getLastRunJobInformation() {
    const [job] = await this.queue.getCompleted(0, -1);
    if (!job) {
      return;
    }
    const data = pick(job, [
      'id',
      'data',
      'progress',
      'processedOn',
      'finishedOn',
      'failedReason',
    ]);
    return data;
  }

  private async getJobCount() {
    const { active, waiting, delayed } = await this.queue.getJobCounts();
    return active + waiting + delayed;
  }

  private getNextJobData(
    job: Job<NotificationIntegrityJobData>,
    count: number,
    failed = 0
  ) {
    if (!job.data.skipVerified) {
      if (job.data.page * job.data.pageSize < count) {
        return {
          ...job.data,
          page: job.data.page + 1,
        };
      }
      return;
    }
    const skip = job.data.skip + failed;
    if (skip < count) {
      return {
        ...job.data,
        page: 1,
        skip,
      };
    }
  }
}
