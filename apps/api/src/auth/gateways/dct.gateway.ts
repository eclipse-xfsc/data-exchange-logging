import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseGateway } from '../../common/api/base.gateway';
import { ConfigType } from '../../config/config.module';

export type LogToken = {
  'gax-dcs:logID': string;
  'gax-dcs:dataTransactionID': string;
  'gax-dcs:contractID': string;
  iss: string;
  sub: string;
  aud: string;
  exp: number;
};

@Injectable()
export class DCTGateway extends BaseGateway {
  constructor(configService: ConfigService<ConfigType>) {
    super(configService.get('general.gateways.dct', { infer: true }));
  }

  async getLogToken(logToken: string): Promise<LogToken> {
    const token = await this.request<LogToken>(
      `/log/token/validate?token=${logToken}`,
      // should be `/log/token/validate, using this while mocked
      'GET', // should be POST
      { logToken },
      { 'content-type': 'application/ld+json', accept: 'application/ld+json' }
    );
    if (!token) {
      throw new ServiceUnavailableException('DCT service is unavailable');
    }
    return token;
  }
}
