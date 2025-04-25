import {
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '../../auth/guards/admin.guard';
import { AdminQueryDto } from '../dtos/log-query.dto';
import {
  AdminLogService,
  LogDynamicInterval,
} from '../services/admin-logs.service';

@ApiTags('Admin/Logs')
@Controller('logs')
@UseGuards(AdminAuthGuard)
export class LogsController {
  constructor(private readonly service: AdminLogService) {}

  @ApiOperation({
    summary: 'Retrieves DELS Logs count and queue count',
    description:
      'This endpoint returns DELS Logs count and queue count. It is used by a dashboard widget.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the configurations.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized to perform the action.',
  })
  @Get('overview')
  async getOverview() {
    return this.service.getOverview();
  }

  @ApiOperation({
    summary:
      'Retrieves DELS logs counts per specified interval grouped by its type',
    description:
      'This endpoint returns DELS logs counts per specified interval grouped by its type. It is used by a dashboard chart.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved chart data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized to perform the action.',
  })
  @ApiParam({
    name: 'interval',
    description: 'The interval to group the logs by.',
    enum: LogDynamicInterval,
  })
  @Get('dynamics/:interval')
  async getLogDynamics(
    @Param('interval', new ParseEnumPipe(LogDynamicInterval))
    interval: LogDynamicInterval
  ) {
    return this.service.getLogsDynamics(interval);
  }

  @ApiOperation({
    summary: 'Retrieves DELS logs',
    description:
      'This endpoint returns DELS logs. It supports pagination and filtering.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved chart data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized to perform the action.',
  })
  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async paginate(@Query() params: AdminQueryDto) {
    return this.service.paginate(params);
  }
}
