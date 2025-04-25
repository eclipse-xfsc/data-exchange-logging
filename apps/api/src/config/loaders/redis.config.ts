import { registerAs } from '@nestjs/config';
import { NodeRole } from 'ioredis';

const loader = () => ({
  type: process.env.REDIS_TYPE,
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  prefix: process.env.REDIS_PREFIX,
  password: process.env.REDIS_PASSWORD,
  nodes: [
    {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
    },
  ],
  options: {
    maxRedirections: 16,
    showFriendlyErrorStack: true,
    slotsRefreshTimeout: 2000,
    scaleReads: 'slave' as NodeRole,
    redisOptions: {
      password: process.env.REDIS_PASSWORD,
      connectTimeout: 10000,
    },
    keyPrefix: process.env.REDIS_PREFIX,
  },
});

export type ConfigType = {
  redis: ReturnType<typeof loader>;
};

export default registerAs('redis', loader);
