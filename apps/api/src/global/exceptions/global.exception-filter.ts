import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { ConfigType } from '../../config/config.module';

export type ErrorResponse = {
  statusCode: number;
  message: string;
  stack?: string;
};
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter<Error> {
  public constructor(
    private logger: Logger,
    private readonly configService: ConfigService<ConfigType>
  ) {}

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    if (status === 404 && request.method === 'OPTIONS') {
      return response.status(204).send();
    }

    this.logger.error(exception.message, exception.stack);

    return response.status(status).json({
      statusCode: status,
      message: exception.message,
      ...(this.configService.get('general.isDevelopment', { infer: true })
        ? { stack: exception.stack }
        : {}),
    } as ErrorResponse);
  }
}
