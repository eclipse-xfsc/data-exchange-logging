import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';

@Injectable()
export class RedisHealthService extends HealthIndicator {
  constructor(@Inject(CACHE_MANAGER) private cacheManager) {
    super();
  }

  check() {
    const client = this.cacheManager.store.getClient();
    return new Promise((resolve, reject) => {
      client.ping((err, result) => {
        resolve(result === 'PONG');
      });
      client.on('error', (error) => {
        console.error(error);
        resolve(false);
      });
    });
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    if (!(await this.check())) {
      throw new HealthCheckError('Redis is down', this.getStatus(key, false));
    }

    return this.getStatus(key, true);
  }
}
