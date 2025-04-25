import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { IsCronExpression } from '../../common/decorators/cron-validator.decorator';

export class SettingsDTO {
  @ApiProperty()
  @IsInt()
  @Min(0)
  @IsOptional()
  SETTING_LOG_RETENTION_PERIOD_DAYS: number;

  @ApiProperty()
  @IsString()
  @IsCronExpression()
  @IsOptional()
  SETTING_LOG_PRUNING_CRON: string;

  @ApiProperty()
  @IsString()
  @IsCronExpression()
  @IsOptional()
  SETTING_LOG_INTEGRITY_CRON: string;
}
