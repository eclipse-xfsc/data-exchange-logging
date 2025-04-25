import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { PaginatorQueryDto } from '../../common/dtos/paginator.dto';
import { InboxNotification } from '../../inbox/entities/inbox-notification.entity';
import { NotificationsQueryParams } from '../../inbox/repository/inbox-notifications.repository';

export class AdminQueryDto
  extends PaginatorQueryDto
  implements NotificationsQueryParams
{
  @IsOptional()
  @IsIn(['contract', 'receiver', 'sender', 'type', 'createdAt', 'verifiedAt'])
  orderBy?: keyof InboxNotification;
}
