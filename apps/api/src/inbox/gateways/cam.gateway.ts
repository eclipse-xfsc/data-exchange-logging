import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseGateway } from '../../common/api/base.gateway';
import { ConfigType } from '../../config/config.module';
import { InboxNotification } from '../entities/inbox-notification.entity';

@Injectable()
export class CamGateway extends BaseGateway {
  constructor(private readonly configService: ConfigService<ConfigType>) {
    super(configService.get('general.gateways.cam', { infer: true }));
  }

  async reportTamperedLog(notification: InboxNotification) {
    const key = await this.request<string>('/report-tampered-log', 'POST', {
      notification,
    });
    if (!key) {
      throw new Error(
        `Could not report tampered log for notification ${notification.id}`
      );
    }
    return key;
  }
}
