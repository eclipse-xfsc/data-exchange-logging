import { SetMetadata } from '@nestjs/common';

export const CONTEXT_METADATA_KEY = 'jsonld';

export type JSONLDContextType = {
  '@context': string | string[];
  '@id'?: string;
  '@type'?: string;
};

export function JSONLDContext(context: JSONLDContextType) {
  return SetMetadata(CONTEXT_METADATA_KEY, context);
}
