import { IsEnum, IsIn, IsOptional, IsString, IsUrl } from 'class-validator';
import { WebHookStatus } from '../entities/webhook.entity';
import { Method } from 'axios';
import { IsHeadersObject } from '../../common/decorators/headers-validator.decorator';

export class WebHookDto {
  @IsOptional()
  @IsEnum(WebHookStatus)
  status?: WebHookStatus;

  @IsUrl()
  url?: string;

  @IsString()
  @IsIn(
    Object.values([
      'get',
      'GET',
      'delete',
      'DELETE',
      'head',
      'HEAD',
      'options',
      'OPTIONS',
      'post',
      'POST',
      'put',
      'PUT',
      'patch',
      'PATCH',
      'purge',
      'PURGE',
      'link',
      'LINK',
      'unlink',
      'UNLINK',
    ])
  )
  method?: Method;

  @IsOptional()
  @IsHeadersObject()
  headers?: Record<string, string | number | boolean>;
}

export class UpdateWebHookDto extends WebHookDto {
  @IsOptional()
  url?: string;

  @IsOptional()
  method?: Method;
}
