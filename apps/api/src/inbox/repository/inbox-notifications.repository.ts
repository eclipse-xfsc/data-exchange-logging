import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import * as moment from 'moment';
import {
  DeepPartial,
  Repository,
  IsNull,
  ObjectLiteral,
  Not,
  MoreThanOrEqual,
  Like,
  FindOptionsWhere,
} from 'typeorm';
import { AdminQueryDto } from '../../admin/dtos/log-query.dto';
import { PaginatorQueryDto } from '../../common/dtos/paginator.dto';
import { BaseDatabaseRepository } from '../../common/repositories/base-db.repository';
import { BaseListParams } from '../../common/repositories/list.params';
import { InboxNotification } from '../entities/inbox-notification.entity';

export interface NotificationsQueryParams
  extends BaseListParams<InboxNotification> {
  contract?: string;
  receiver?: string;
  skipVerified?: boolean;
  skip?: number;
}

export const isNotificationsQueryParams = (
  obj: NotificationsQueryParams | AdminQueryDto
): obj is NotificationsQueryParams => {
  return !!(
    obj &&
    ((obj as NotificationsQueryParams).skip ||
      (obj as NotificationsQueryParams).skipVerified)
  );
};

@Injectable()
export class InboxNotificationRepository extends BaseDatabaseRepository<InboxNotification> {
  public constructor(
    @Inject(CACHE_MANAGER) cache: Cache,
    @InjectRepository(InboxNotification)
    repository: Repository<InboxNotification>
  ) {
    super(cache, repository);
  }

  public getEntity(id: string): Promise<InboxNotification> {
    return super.getEntity(id);
  }

  public save(entity: DeepPartial<InboxNotification>) {
    return this.repository.save(entity);
  }

  public deleteBy<Criteria>(criteria: Criteria) {
    return this.repository.delete(criteria);
  }

  public listIds(params: NotificationsQueryParams) {
    return this.repository.find({
      select: ['id'],
      ...this.getFindOptions(params),
    });
  }

  public getVerifiableNotifications(
    params: Omit<
      NotificationsQueryParams,
      'skipVerified' | 'pageSize' | 'page'
    > &
      ({ skipVerified: boolean } | { pageSize: number; page: number })
  ) {
    return super.paginate({
      ...params,
      orderBy: 'createdAt',
      orderDirection: 'ASC',
    });
  }

  public getVerifiedCount() {
    return this.repository.count({ where: { verifiedAt: Not(IsNull()) } });
  }

  public getCount() {
    return this.repository.count();
  }

  public async getLogDynamics(
    intervalType: 'hour' | 'day' = 'hour',
    starting: moment.Moment = moment()
  ) {
    const result = await this.repository
      .createQueryBuilder('inbox_notification')
      .select('COUNT(*)', 'count')
      .addSelect(`date_trunc(:interval, "createdAt")`, 'time')
      .addSelect('type', 'type')
      .where({
        createdAt: MoreThanOrEqual(moment(starting).startOf('day')),
      })
      .groupBy('time')
      .addGroupBy('type')
      .orderBy('time', 'ASC')
      .setParameter('interval', intervalType)
      .execute();
    return result;
  }

  protected getFindOptions(params?: NotificationsQueryParams | AdminQueryDto) {
    const options = super.getFindOptions(params);
    options.where = (options.where ?? {}) as
      | FindOptionsWhere<InboxNotification>
      | ObjectLiteral;
    if (isNotificationsQueryParams(params)) {
      if (params.skip > 0) {
        options.skip = options.skip + params.skip;
      }
      if (params.skipVerified) {
        options.where.verifiedAt = IsNull();
      }
    }
    if ((params as AdminQueryDto).searchTerm) {
      options.where = [
        {
          contract: Like(`%${(params as PaginatorQueryDto).searchTerm}%`),
        },
        {
          receiver: Like(`%${(params as PaginatorQueryDto).searchTerm}%`),
        },
        {
          sender: Like(`%${(params as PaginatorQueryDto).searchTerm}%`),
        },
      ];
    } else {
      ['contractId', 'requester'].forEach((key) => {
        if (params[key]) {
          options.where[key] = params[key];
        }
      });
    }

    return options;
  }
}
