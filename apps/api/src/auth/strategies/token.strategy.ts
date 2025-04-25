import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthService } from '../services/auth.service';

@Injectable()
export class TokenStrategy extends PassportStrategy(Strategy, 'custom') {
  constructor(protected authService: AuthService) {
    super();
  }

  async validate(req) {
    const token = req.headers.authorization;
    if (!token) {
      throw new ForbiddenException('No token provided');
    }
    const data = await this.authService.validateToken(
      token.replace('Bearer ', '')
    );
    return data;
  }
}
