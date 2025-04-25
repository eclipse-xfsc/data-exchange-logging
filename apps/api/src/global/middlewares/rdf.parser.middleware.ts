import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction } from 'express';
import rdfParser from 'rdf-parse';
import { json } from 'body-parser';
import rdfSerializer from 'rdf-serialize';
import * as streamToString from 'stream-to-string';

@Injectable()
export class RdfBodyParserMiddleware implements NestMiddleware {
  private readonly jsonMiddleware: ReturnType<typeof json>;

  constructor() {
    this.jsonMiddleware = json({
      type: ['application/ld+json', 'application/json'],
    });
  }

  async use(req: any, res: Response, next: NextFunction) {
    if (req.method.toLowerCase() !== 'options') {
      const types = await rdfSerializer.getContentTypes();
      if (!types.includes(req.headers['content-type'])) {
        throw new BadRequestException(
          `Unsupported "Accept" content type. Supported types: ${types.join(
            ', '
          )}`
        );
      }

      switch (req.headers['content-type']) {
        case 'application/ld+json':
        case 'application/json': {
          this.jsonMiddleware(req, res as any, next);
          return;
        }
        default: {
          req.body = await this.parseRdf(req as NodeJS.ReadableStream);
        }
      }
    }
    next();
  }

  async parseRdf(req: NodeJS.ReadableStream) {
    const quadsStream = rdfParser.parse(req, {
      contentType: (req as any).headers['content-type'],
    });
    const jsonLDStream = rdfSerializer.serialize(quadsStream, {
      contentType: 'application/ld+json',
    });
    const json = await streamToString(jsonLDStream);
    const input = JSON.parse(json);
    return input;
  }
}
