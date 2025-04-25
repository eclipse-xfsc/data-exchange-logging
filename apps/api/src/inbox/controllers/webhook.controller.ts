import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LogToken } from '../../auth/gateways/dct.gateway';
import { TokenAuthGuard } from '../../auth/guards/token.guard';
import { WebHookQueryDto } from '../dtos/webhook-query.dto';
import { UpdateWebHookDto, WebHookDto } from '../dtos/webhook.dto';
import { WebHookQueryParams } from '../repository/webhook.repository';
import { WebHookService } from '../services/webhook.service';
@ApiTags('Inbox/Callbacks')
@Controller('/callback')
@UseGuards(TokenAuthGuard)
export class WebHookController {
  constructor(private readonly webHookService: WebHookService) {}

  @ApiOperation({
    summary: 'Returns registered callbacks',
  })
  @ApiQuery({ type: [WebHookQueryDto] })
  @ApiResponse({
    status: 200,
    description: `Paginated response of participants' callbacks`,
  })
  @ApiBearerAuth('Log Token')
  @Get()
  async paginate(
    @Query() query: WebHookQueryParams,
    @Req() { auth }: { auth: LogToken }
  ) {
    return this.webHookService.paginateWebHooks(auth.sub, query);
  }

  @ApiOperation({
    summary: 'Registers a callback',
  })
  @ApiBody({ type: WebHookDto })
  @ApiResponse({
    status: 200,
    description: `Stored callback`,
  })
  @ApiBearerAuth('Log Token')
  @Post()
  async create(
    @Body() webHookDto: WebHookDto,
    @Req() { auth }: { auth: LogToken }
  ) {
    return this.webHookService.createWebHook({
      ...webHookDto,
      participantId: auth.sub,
      contractId: auth['gax-dcs:contractID'],
    });
  }

  @ApiOperation({
    summary: 'Updates a callback',
  })
  @ApiBody({ type: UpdateWebHookDto })
  @ApiResponse({
    status: 200,
    description: `Updated callback`,
  })
  @ApiBearerAuth('Log Token')
  @Put(':webHookId')
  async update(
    @Param('webHookId') webHookId: string,
    @Body() webHookDto: UpdateWebHookDto,
    @Req() { auth }: { auth: LogToken }
  ) {
    return this.webHookService.updateWebHook(webHookId, auth.sub, {
      ...webHookDto,
      contractId: auth['gax-dcs:contractID'],
    });
  }
  @ApiOperation({
    summary: 'Disables specified callback',
  })
  @ApiResponse({
    status: 200,
    description: `Disabled callback`,
  })
  @ApiBearerAuth('Log Token')
  @Delete(':webHookId')
  async disable(
    @Param('webHookId') webHookId: string,
    @Req() { auth }: { auth: LogToken }
  ) {
    return this.webHookService.disableWebHook(webHookId, auth.sub);
  }
}
