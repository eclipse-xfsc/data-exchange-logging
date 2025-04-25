import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DIDTrustServiceGateway } from '@gaia-x/gaia-x-vc';
import { BaseGateway } from '../../common/api/base.gateway';
import { ConfigType } from '../../config/config.module';

@Injectable()
export class TrustServiceGateway
  extends BaseGateway
  implements DIDTrustServiceGateway
{
  constructor(readonly configService: ConfigService<ConfigType>) {
    super(configService.get('general.gateways.contracts', { infer: true }));
  }

  public async getParticipantKey(participantDID: string) {
    return this.request(`/get-key?did=${participantDID}`, 'GET');
  }

  async getSenderSigningKey(contractId: string) {
    const key = await this.request<string>('/sender-signing-key', 'GET', {
      contractId,
    });
    if (!key) {
      throw new Error(
        `Could not get sender signing key for contract ${contractId}`
      );
    }
    return key;
  }
}
