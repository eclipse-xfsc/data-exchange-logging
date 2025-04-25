import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Response } from 'express';
import { GlobalExceptionFilter } from './global.exception-filter';

@Catch(ServiceUnavailableException)
export class ServiceUnavailableFilter
  extends GlobalExceptionFilter
  implements ExceptionFilter<ServiceUnavailableException>
{
  catch(exception: ServiceUnavailableException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (request.url === '/api/health') {
      // `/health` endpoint throws custom ServiceUnavailableException with details of health checks
      response.status(exception.getStatus()).json(exception.getResponse());
      return;
    }
    return super.catch(exception, host);
  }
}
