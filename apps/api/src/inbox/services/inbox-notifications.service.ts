import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DeepPartial, EntityNotFoundError, LessThan } from 'typeorm';
import * as moment from 'moment';
import { InboxNotificationRepository } from '../repository/inbox-notifications.repository';
import { CreateInboxNotificationDto } from '../dtos/create-inbox-notification.dto';
import { QueryNotificationsDto } from '../dtos/query-notifications.dto';
import { LogToken } from '../../auth/gateways/dct.gateway';
import { InboxNotification } from '../entities/inbox-notification.entity';

@Injectable()
export class InboxNotificationsService {
  public constructor(
    protected notificationRepository: InboxNotificationRepository
  ) {}

  async get(logToken: LogToken, id: string) {
    try {
      const notification = await this.notificationRepository.getEntity(id);
      if (
        ![notification.sender, notification.receiver].includes(logToken.sub)
      ) {
        throw new ForbiddenException(
          'Sender/Receiver does not match log token'
        );
      }
      return notification;
    } catch (e) {
      if (e instanceof EntityNotFoundError) {
        throw new NotFoundException('Notification not found');
      }
      throw e;
    }
  }

  async create(
    id: string,
    notification:
      | CreateInboxNotificationDto
      | DeepPartial<CreateInboxNotificationDto>
  ) {
    const result = await this.notificationRepository.save({
      ...notification.credentialSubject,
      verifiableCrendetial: JSON.stringify(notification),
      id,
    });

    return result;
  }

  async updateNotification(
    id: string,
    notification: DeepPartial<InboxNotification>
  ) {
    const entity = await this.notificationRepository.getEntity(id);
    if (!entity) {
      throw new BadRequestException('Notification not found');
    }
    return this.notificationRepository.save({
      ...notification,
      id,
    });
  }

  async listIds(logToken: LogToken, queryCriteria?: QueryNotificationsDto) {
    const results = await this.notificationRepository.listIds({
      contract: logToken['gax-dcs:contractID'],
    });
    return results.map((r) => r.id);
  }

  async deleteOldLogs(periodDays: number) {
    const deleted = await this.notificationRepository.deleteBy({
      createdAt: LessThan(moment().subtract(periodDays, 'days').toDate()),
    });
    return deleted.affected;
  }
}
