import {
  Controller,
  Post,
  UseGuards,
  Get,
  Body,
  Options,
  Response,
  UseInterceptors,
  Param,
  Req,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { InboxNotificationsService } from '../services/inbox-notifications.service';
import rdfSerializer from 'rdf-serialize';
import { Response as HttpResponse } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { TokenAuthGuard } from '../../auth/guards/token.guard';
import { InboxDataProvider } from '../services/inbox-provider.processor';
import { ConfigType } from '../../config/config.module';
import { QueryNotificationsResponseDto } from '../dtos/query-notifications-response.dto';
import { RdfInterceptor } from '../../global/interceptors/rdf.interceptor';
import { TransformInterceptor } from '../../global/interceptors/transform.interceptor';
import { QueryNotificationsDto } from '../dtos/query-notifications.dto';
import { InboxNotificationResponseDto } from '../dtos/inbox-notification-response.dto';
import { CreateInboxNotificationDto } from '../dtos/create-inbox-notification.dto';
import { VerifiableCredentialPipe } from '../pipes/verifiable-credentials.pipe';

@ApiTags('Inbox')
@Controller('inbox')
@UseGuards(TokenAuthGuard)
export class InboxNotificationsController {
  constructor(
    private readonly inboxDataProvider: InboxDataProvider,
    private readonly inboxService: InboxNotificationsService,
    private readonly configService: ConfigService<ConfigType>
  ) {}

  @ApiOperation({
    summary: 'Gets the allowed methods for inbox gateway.',
    description:
      'The response should contain the methods that are allowed to be called within Inbox gateway and the content types that the user can set.',
  })
  @ApiResponse({
    status: 200,
    description: 'Will contain the Allow and Acept-post headers.',
  })
  @ApiBearerAuth('Log Token')
  @Options()
  async options(@Response() response: HttpResponse) {
    response.set('Allow', 'GET, POST, OPTIONS, HEAD');
    response.set(
      'Accept-Post',
      (await rdfSerializer.getContentTypes()).join(', ')
    );
    response.status(200).send();
  }

  @ApiOperation({
    summary:
      'Filters and retrieves a list of notifications in a serialized as a RDF resource',
    description:
      'The endpoint will filter and serialize the result in an ldf format. The response will contain the uris of the notifications.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieve the filtered list of notifications.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request. Additional information shall be provided via header or body.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized to perform the action.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Will be responded for access to a notification or an inbox in case the consumer is not a contracted party or entitled to access. This status code must be responded when a notification or inbox does not exist.',
  })
  @ApiBearerAuth('Log Token')
  @Get()
  @UseInterceptors(new TransformInterceptor(QueryNotificationsResponseDto))
  @UseInterceptors(RdfInterceptor)
  async getFilteredNotifications(
    @Query() queryParams: QueryNotificationsDto,
    @Req()
    { auth }: any
  ): Promise<QueryNotificationsResponseDto> {
    const ids = await this.inboxService.listIds(auth, queryParams);
    return new QueryNotificationsResults(
      this.configService.get('server.endpoint', { infer: true }),
      ids
    );
  }

  @ApiOperation({
    summary: 'Retrieves a notification by id.',
    description:
      'Returns all the data related to a notification which is fetched by id',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully returns the notification.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request. Additional information shall be provided via header or body.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized to perform the action.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Will be responded for access to a notification or an inbox in case the consumer is not a contracted party or entitled to access. This status code must be responded when a notification or inbox does not exist.',
  })
  @ApiResponse({
    status: 404,
    description: 'Notification could not be found.',
  })
  @ApiBearerAuth('Log Token')
  @Get(':id')
  @UseInterceptors(new TransformInterceptor(InboxNotificationResponseDto))
  @UseInterceptors(RdfInterceptor)
  async getNotification(
    @Param() { id }: { id: string },
    @Req()
    { auth }: any
  ): Promise<InboxNotificationResponseDto> {
    const notification = await this.inboxService.get(auth, id);
    return notification;
  }

  @ApiOperation({
    summary:
      'Validates, process and retrieves the location of the that will be stored notification.',
    description:
      'Validates the data of the notification and the data of the requester. Once the data is confirmed to be correct will be process asynchronous. The eWill retrieve a Location header, with the uri where the notification will be placed.',
  })
  @ApiBody({ type: [CreateInboxNotificationDto] })
  @ApiResponse({
    status: 200,
    description: 'The notification has been processed and created.',
  })
  @ApiResponse({
    status: 201,
    description:
      'The notification and requester data validation passed and will be processed asynchronous.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request. Additional information shall be provided via header or body.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized to perform the action.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Will be responded for access to a notification or an inbox in case the consumer is not a contracted party or entitled to access. This status code must be responded when a notification or inbox does not exist.',
  })
  @ApiBearerAuth('Log Token')
  @ApiConsumes('application/ld+json')
  @Post()
  async processNotification(
    @Body(VerifiableCredentialPipe) notification: CreateInboxNotificationDto,
    @Response() response: HttpResponse,
    @Req()
    { auth }: any
  ) {
    const trackId = uuidv4();
    await this.inboxDataProvider.sendToQueue(auth, notification, {
      trackId,
    });
    response.set(
      'Location',
      `${this.configService.get('server.endpoint', {
        infer: true,
      })}/api/inbox/${trackId}`
    );
    response.status(202).send([]);
  }
}

class QueryNotificationsResults {
  constructor(endpoint: string, notificationsIds: string[]) {
    this.contains = notificationsIds;
    this.id = endpoint;
    this['@context'] = 'http://www.w3.org/ns/ldp';
  }
  contains: string[];
  id: string;
  '@context': string;
}
