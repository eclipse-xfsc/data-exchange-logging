import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import * as moment from 'moment';
import { InboxNotificationRepository } from '../../inbox/repository/inbox-notifications.repository';
import { AdminQueryDto } from '../dtos/log-query.dto';

export enum LogDynamicInterval {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

@Injectable()
export class AdminLogService {
  constructor(
    private readonly repo: InboxNotificationRepository,
    @InjectQueue('{notifications}') private readonly queue: Queue
  ) {}

  async getOverview() {
    const count = await this.repo.getCount();
    const inQueue = await this.queue.getJobCountByTypes([
      'active',
      'delayed',
      'paused',
      'waiting',
    ]);
    return {
      count,
      inQueue,
    };
  }

  async getLogsDynamics(interval: LogDynamicInterval) {
    let intervalType: Parameters<typeof this.repo.getLogDynamics>[0];
    let starting: Parameters<typeof this.repo.getLogDynamics>[1];
    switch (interval) {
      case LogDynamicInterval.DAY: {
        starting = moment();
        intervalType = 'hour';
        break;
      }
      case LogDynamicInterval.WEEK: {
        starting = moment().subtract(1, 'week');
        intervalType = 'day';
        break;
      }
      case LogDynamicInterval.MONTH: {
        starting = moment().subtract(1, 'month');
        intervalType = 'day';
      }
    }
    return this.repo.getLogDynamics(intervalType, starting);
  }

  public paginate(params: AdminQueryDto) {
    return this.repo.paginate(params);
  }
}
