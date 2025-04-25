import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { map, tap } from 'rxjs';
import rdfSerializer from 'rdf-serialize';
import rdfParser from 'rdf-parse';
import { Readable } from 'stream';
import * as streamToString from 'stream-to-string';

export class RdfInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    const request = context.switchToHttp().getRequest();
    const responseType =
      !request.headers['accept'] || request.headers['accept'] === '*/*'
        ? 'application/ld+json'
        : request.headers['accept'];

    const types = await rdfSerializer.getContentTypes();
    if (!types.includes(responseType)) {
      throw new BadRequestException(
        `Unsupported "Accept" content type. Supported types: ${types.join(
          ', '
        )}`
      );
    }

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        res.header('content-type', responseType);
      }),
      map(async (data) => {
        const awaitedData = await data;
        const quadsStream = rdfParser.parse(
          Readable.from(JSON.stringify(awaitedData)),
          {
            contentType: 'application/ld+json',
          }
        );
        const jsonLDStream = rdfSerializer.serialize(quadsStream, {
          contentType: responseType,
        });
        const serializedResponse = await streamToString(jsonLDStream);
        return serializedResponse;
      })
    );
  }
}
