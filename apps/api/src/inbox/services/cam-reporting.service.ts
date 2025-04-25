import { Injectable } from '@nestjs/common';
import { AbstractCAMAdapter } from '../adapters';
import { InboxNotificationRepository } from '../repository/inbox-notifications.repository';

@Injectable()
export class CamReportingService {
  public constructor(
    protected notificationRepository: InboxNotificationRepository,
    private readonly camAdapter: AbstractCAMAdapter
  ) {}

  async reportTamperedLog(id: string) {
    const notification = await this.notificationRepository.getEntity(id);
    await this.camAdapter.reportCorruptedLog(notification);
  }
}
