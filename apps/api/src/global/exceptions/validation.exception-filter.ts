import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { ConfigType } from '../../config/config.module';
import { ValidationErrorResponse } from '@dels/common';

@Catch(BadRequestException)
export class ValidationExceptionFilter
  implements ExceptionFilter<BadRequestException>
{
  public constructor(
    private logger: Logger,
    private readonly configService: ConfigService<ConfigType>
  ) {}

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const exceptionResponse = exception.getResponse();
    if (typeof exceptionResponse === 'string') {
      response.status(exception.getStatus()).json({
        statusCode: exception.getStatus(),
        message: [exceptionResponse],
        error: 'Bad Request',
      } as ValidationErrorResponse);
    } else {
      response.status(exception.getStatus()).json({
        ...exceptionResponse,
        message: [
          ...(Array.isArray((exceptionResponse as any).message)
            ? (exceptionResponse as any).message
            : [(exceptionResponse as any).message]),
        ],
      } as ValidationErrorResponse);
    }
  }
}
