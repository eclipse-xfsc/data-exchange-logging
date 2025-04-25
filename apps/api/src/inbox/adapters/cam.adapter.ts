import { Injectable } from '@nestjs/common';
import { AbstractCAMAdapter } from '.';
import { InboxNotification } from '../entities/inbox-notification.entity';
import { CamGateway } from '../gateways/cam.gateway';

@Injectable()
export class CamAdapter extends AbstractCAMAdapter {
  constructor(private readonly camGateway: CamGateway) {
    super();
  }

  async reportCorruptedLog(notification: InboxNotification): Promise<void> {
    this.camGateway.reportTamperedLog(notification);
  }
}
