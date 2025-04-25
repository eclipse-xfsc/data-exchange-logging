import { ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { LogTokenGateway } from '../../global/gateways/log-token.gateway';
import { AuthService } from './auth.service';

const get = jest.fn();
const sign = jest.fn();
const validateToken = jest.fn();

describe('AuthService', () => {
  let service: AuthService;
  const doSetup = async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useFactory: () => ({
            get,
          }),
        },
        {
          provide: JwtService,
          useFactory: () => ({
            sign,
          }),
        },
        {
          provide: LogTokenGateway,
          useFactory: () => ({
            validateToken,
          }),
        },
      ],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
  };

  describe('validateAdmin', () => {
    beforeAll(async () => {
      await doSetup();
      get.mockReturnValue({
        username: 'admin',
        password: 'admin',
      });
    });
    it('isAdmin', async () => {
      const result = await service.validateAdmin('admin', 'admin');
      expect(result).toEqual({ username: 'admin' });
    });

    it('is not admin', async () => {
      const result = await service.validateAdmin('test', 'test');
      expect(result).toEqual(null);
    });
  });

  describe('login admin', () => {
    beforeEach(async () => {
      jest.useFakeTimers('modern');
      jest.setSystemTime(new Date(2020, 3, 1));
      await doSetup();
      get.mockReturnValue(5);
      sign.mockReturnValue('test');
    });
    it('returns correct auth token', async () => {
      const token = await service.loginAdmin({ username: 'test' });
      expect(token).toEqual({ accessToken: 'test', expiresAt: 1585688405 });
      expect(sign).toBeCalled();
    });
  });

  describe('validates token', () => {
    beforeAll(async () => {
      await doSetup();
      validateToken.mockResolvedValueOnce({}).mockRejectedValue(new Error());
    });

    it('returns validated token', async () => {
      const token = await service.validateToken('token');
      expect(token).toBeTruthy();
    });

    it('throws 403 due to token being invalid', () => {
      expect(service.validateToken('token')).rejects.toThrow(
        new ForbiddenException()
      );
    });
  });
});
