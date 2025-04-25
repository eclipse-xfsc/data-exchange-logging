import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';
import { VerifiableCredential } from '@gaia-x/gaia-x-vc';
import { JSONLDContext } from '../../common/decorators/context.validator.decorator';

const context = {
  '@context': {
    id: '@id',
    type: '@type',
    sender: 'http:/del.mock/contexts/sender',
    receiver: 'http:/del.mock/contexts/receiver',
    contract: 'http:/del.mock/contexts/contract',
    description: 'http:/del.mock/contexts/description',
  },
};

@JSONLDContext(context as any)
export class CreateInboxNotification {
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

  @ApiProperty()
  @IsString()
  @IsIn([
    'SendDataNotification',
    'ReceivedDataNotification',
    'ContractSignedNotification',
  ])
  type: string;
}

export class CreateInboxNotificationDto extends VerifiableCredential(
  CreateInboxNotification
) {}
