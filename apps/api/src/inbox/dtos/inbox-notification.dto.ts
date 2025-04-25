import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { JSONLDContext } from '../../common/decorators/context.validator.decorator';

const context = {
  '@context': {
    id: '@id',
    sender: 'http:/del.mock/contexts/sender',
    receiver: 'http:/del.mock/contexts/receiver',
    contract: 'http:/del.mock/contexts/contract',
    description: 'http:/del.mock/contexts/description',
  },
};

@JSONLDContext(context as any)
export class InboxNotificationDto {
  @ApiProperty()
  @IsString()
  sender: string;

  @ApiProperty()
  @IsString()
  receiver: string;

  @ApiProperty()
  @IsString()
  contract: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  '@context': any;
}
