import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as moment from 'moment';
import { AuthToken } from '@dels/common';
import { ConfigType } from '../../config/config.module';
import { DCTGateway } from '../gateways/dct.gateway';

@Injectable()
export class AuthService {
  public constructor(
    protected readonly configService: ConfigService<ConfigType>,
    private readonly jwtService: JwtService,
    protected logTokenApi: DCTGateway
  ) {}

  async validateAdmin(username: string, pass: string): Promise<any> {
    const adminConfig = this.configService.get('admin', { infer: true });
    console.log('adminConfig', adminConfig);
    if (username === adminConfig.username && pass === adminConfig.password) {
      return {
        username,
      };
    }
    return null;
  }

  async loginAdmin(user: any): Promise<AuthToken> {
    const payload = { username: user.username };
    return {
      accessToken: this.jwtService.sign(payload),
      expiresAt: moment(new Date())
        .add(
          this.configService.get('admin.auth.expiresIn', { infer: true }),
          'seconds'
        )
        .unix(),
    };
  }

  async validateToken(token: string) {
    try {
      return await this.logTokenApi.getLogToken(token);
    } catch {
      throw new ForbiddenException();
    }
  }
}
