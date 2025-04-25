import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class QueryNotificationsDto implements Readonly<QueryNotificationsDto> {
  @ApiProperty()
  @IsOptional()
  createdAt?: string;

  @ApiProperty()
  @IsOptional()
  updatedAt?: string;
}
