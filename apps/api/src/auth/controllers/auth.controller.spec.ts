import { Test } from '@nestjs/testing';
import { AuthService } from '../services/auth.service';
import moment = require('moment');

import { AuthController } from './auth.controller';

describe('/authenticate', () => {
  let controller: AuthController;
  const time = moment().unix();
  const doSetup = async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useFactory: () => ({
            loginAdmin: jest.fn().mockResolvedValue({
              accessToken: 'test',
              expiresAt: time,
            }),
          }),
        },
      ],
    }).compile();

    controller = moduleRef.get<AuthController>(AuthController);
  };

  describe('POST /auth/login', () => {
    it('sets the cookie correct', async () => {
      const request = {
        auth: {},
      };
      const cookieMockFn = jest.fn();
      const response = {
        cookie: cookieMockFn,
      };
      await doSetup();
      const result = await controller.login(request, response);
      console.log('result', result);
      expect(result).toEqual({ accessToken: 'test', expiresAt: time });
      return expect(cookieMockFn).toBeCalledWith('accessToken', 'test', {
        expires: moment.unix(time).toDate(),
        httpOnly: true,
      });
    });
  });

  describe('POST /auth/logout', () => {
    it('sets the cookie correct', async () => {
      const request = {
        cookies: {
          accessToken: 'test',
        },
      };
      const cookieMockFn = jest.fn();
      const response = {
        cookie: cookieMockFn,
      };
      await doSetup();
      const result = await controller.logout(request, response);
      expect(result).toEqual(true);
      return expect(cookieMockFn).toBeCalled();
    });
  });
});
