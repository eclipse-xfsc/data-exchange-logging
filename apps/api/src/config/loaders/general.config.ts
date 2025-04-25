import { registerAs } from '@nestjs/config';

const loader = () => ({
  isDevelopment: Boolean(process.env.NODE_ENV === 'development'),

  cache: {
    store: process.env.CACHE_TYPE,
    ttl: parseInt(process.env.CACHE_TTL),
  },
  gateways: {
    contracts: process.env.TRUST_SERVICE_GATEWAY_HOST,
    cam: process.env.CAM_GATEWAY_HOST,
    dct: process.env.DCT_GATEWAY_HOST,
  },
});

export type ConfigType = {
  general: ReturnType<typeof loader>;
};

export default registerAs('general', loader);
