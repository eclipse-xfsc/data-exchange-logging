import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../config/config.module';

@Injectable()
export class AdminStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService<ConfigType>) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => req.cookies.accessToken as string,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('admin.auth.secret', { infer: true }),
    });
  }

  async validate(payload: any) {
    return { username: payload.username };
  }
}
