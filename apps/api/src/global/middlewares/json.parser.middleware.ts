import { Injectable, NestMiddleware } from '@nestjs/common';
import { json } from 'body-parser';
import { NextFunction } from 'express';

@Injectable()
export class JsonBodyParserMiddleware implements NestMiddleware {
  use(req: any, res: any, next: NextFunction) {
    json()(req, res, next);
  }
}
