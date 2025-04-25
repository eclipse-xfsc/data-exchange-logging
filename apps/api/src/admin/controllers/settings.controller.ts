import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '../../auth/guards/admin.guard';
import { SettingsDTO } from '../dtos/settings.dto';
import { SettingsService } from '../services/settings.service';

@ApiTags('Admin/Settings')
@Controller('settings')
@UseGuards(AdminAuthGuard)
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @ApiOperation({
    summary: 'Retrieves DELS configurations.',
    description:
      'The response should contain the methods that are allowed to be called within Inbox gateway and the content types that the user can set.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the configurations.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized to perform the action.',
  })
  @Get()
  async get() {
    return (await this.service.list()).reduce(
      (acum, setting) => ({ ...acum, [setting.name]: setting.value }),
      {}
    );
  }

  @ApiOperation({
    summary: 'Updates DELS configurations.',
  })
  @ApiResponse({ status: 200, description: 'Retrieves the updates settings.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized to perform the action.',
  })
  @ApiBody({ type: [SettingsDTO] })
  @Put()
  async update(@Body() data: SettingsDTO) {
    return this.service.updateSettings(data);
  }
}
