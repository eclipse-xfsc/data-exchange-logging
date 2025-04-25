import { Controller, Post, Request, Res, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from '../guards/local.guard';
import { AuthService } from '../services/auth.service';
import * as moment from 'moment';
import { AdminAuthGuard } from '../guards/admin.guard';
import { ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Admin/Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req, @Res({ passthrough: true }) res) {
    const token = await this.authService.loginAdmin(req.auth);
    res.cookie('accessToken', token.accessToken, {
      httpOnly: true,
      expires: moment.unix(token.expiresAt).toDate(),
    });
    return token;
  }

  @UseGuards(AdminAuthGuard)
  @Post('auth/logout')
  async logout(@Request() req, @Res({ passthrough: true }) res) {
    res.cookie('accessToken', req.cookies.accessToken, {
      httpOnly: true,
      session: false,
      maxAge: 0,
      expires: new Date(),
    });
    return true;
  }
}
