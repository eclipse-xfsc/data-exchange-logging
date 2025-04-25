import { SignatureService } from '@gaia-x/gaia-x-vc';
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { CreateInboxNotificationDto } from '../dtos/create-inbox-notification.dto';

@Injectable()
export class VerifiableCredentialPipe
  implements PipeTransform<CreateInboxNotificationDto>
{
  constructor(private readonly signatureService: SignatureService) {}

  async transform(
    value: CreateInboxNotificationDto,
    metadata: ArgumentMetadata
  ) {
    const result = await this.signatureService.verifyCredential(value);
    if (!result.verified) {
      throw new BadRequestException('Invalid Signature.');
    }
    return value;
  }
}
