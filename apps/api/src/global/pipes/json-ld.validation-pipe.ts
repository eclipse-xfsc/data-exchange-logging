import { ValidationPipe } from '@nestjs/common';
import * as jsonld from 'jsonld';
import { CONTEXT_METADATA_KEY } from '../../common/decorators/context.validator.decorator';

export class JSONLDValidationPipe extends ValidationPipe {
  async transform(value: any, metadata: any) {
    const schema = Reflect.getMetadata(CONTEXT_METADATA_KEY, metadata.metatype);
    if (schema) {
      value = await jsonld.compact(value, schema);
    }
    return super.transform(value, metadata);
  }
}
