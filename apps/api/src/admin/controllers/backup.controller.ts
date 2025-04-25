import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DBBackupDTO } from '../../../../../libs/common/src';
import { AdminAuthGuard } from '../../auth/guards/admin.guard';
import { BackupsService } from '../services/backup.service';

@ApiTags('Admin/Backups')
@Controller('backups')
@UseGuards(AdminAuthGuard)
export class BackupsController {
  constructor(private readonly service: BackupsService) {}

  @ApiOperation({
    summary: 'Retrieves DELS backups information.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the backup information.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized to perform the action.',
  })
  @Get()
  async get(): Promise<DBBackupDTO> {
    return this.service.getBackupInformation();
  }
}
