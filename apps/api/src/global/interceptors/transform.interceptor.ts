import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { plainToInstance } from 'class-transformer';

interface ClassType<T> {
  new (): T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<Partial<T>, T> {
  constructor(private readonly classType: ClassType<T>) {}

  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    return next
      .handle()
      .pipe(map((data) => plainToInstance(this.classType, data)));
  }
}
