import { InboxNotification } from '../entities/inbox-notification.entity';

export abstract class AbstractCAMAdapter {
  abstract reportCorruptedLog(notification: InboxNotification): Promise<void>;
}
