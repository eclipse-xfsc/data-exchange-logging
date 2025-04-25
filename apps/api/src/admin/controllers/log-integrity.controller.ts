import {
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  Post,
  Put,
  Sse,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '../../auth/guards/admin.guard';
import { AdminLogIntegrityService } from '../services/admin-log-integrity.service';

@ApiTags('Admin/Log Integrity')
@Controller('log-integrity')
@UseGuards(AdminAuthGuard)
export class LogIntegrityController {
  constructor(private readonly service: AdminLogIntegrityService) {}

  @ApiOperation({
    summary: 'Retrieves DELS integrity check status',
    description:
      'This endpoint returns DELS integrity check information like status, last executed date, next execution date, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved DELS integrity check information.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized to perform the action.',
  })
  @Get()
  async get() {
    return this.service.getIntegrityCheckOverview();
  }

  @ApiOperation({
    summary: 'Pauses DELS integrity check CRON',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully paused/started DELS integrity check CRON',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized to perform the action.',
  })
  @ApiParam({
    name: 'pause',
    description: 'The pause flag to set.',
    enum: ['true', 'false'],
  })
  @Put('/:pause')
  @UsePipes(ValidationPipe)
  async update(@Param('pause', ParseBoolPipe) pause: boolean) {
    if (pause) {
      return this.service.pauseIntegrityCheck();
    } else {
      return this.service.resumeIntegrityCheck();
    }
  }

  @ApiOperation({
    summary: 'Start integrity check jobs manually',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully started integrity check jobs',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized to perform the action.',
  })
  @Post('/start')
  async start() {
    return this.service.startIntegrityCheck();
  }

  @ApiOperation({
    summary: 'Verify DELS integrity check notification',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully verified DELS integrity check notification',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized to perform the action.',
  })
  @ApiParam({
    name: 'id',
    description: 'The notification id to verify.',
  })
  @Post('/verify/:id')
  async verify(@Param('id') notificationId: string) {
    return this.service.verifyNotification(notificationId);
  }

  @ApiOperation({
    summary: 'Integrity check progrss stream (EventSource API)',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully conected to Integrity check progrss stream',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized to perform the action.',
  })
  @Sse('/progress')
  async progress() {
    return this.service.sendEvents();
  }
}
