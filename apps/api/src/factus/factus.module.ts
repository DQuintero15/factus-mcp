import { Global, Logger, Module } from '@nestjs/common';

import { FactusSdkAdapter } from '@factus-mcp/core';
import { FactusClient, type FactusTokenCache } from '@factus-mcp/factus-sdk';

import {
  APP_CONFIG,
  FACTUS_PORT,
  FACTUS_TOKEN_CACHE,
  loadAppConfig,
  type AppConfig,
} from '../config/app-config.js';
import { createRedisTokenCache } from './redis-token-cache.js';

@Global()
@Module({
  providers: [
    {
      provide: APP_CONFIG,
      useFactory: loadAppConfig,
    },
    {
      provide: FACTUS_TOKEN_CACHE,
      useFactory: async (config: AppConfig) => {
        const logger = new Logger('FactusRedisTokenCache');
        return createRedisTokenCache({
          url: config.redisUrl,
          keyPrefix: config.redisKeyPrefix,
          onError: (err) => logger.error(`Redis token cache error: ${err.message}`),
        });
      },
      inject: [APP_CONFIG],
    },
    {
      provide: FactusClient,
      useFactory: (config: AppConfig, tokenCache: FactusTokenCache) => {
        const logger = new Logger('FactusHttpClient');
        return new FactusClient({
          tokenTtlSeconds: config.factusTokenTtlSeconds,
          tokenCache,
          http: { logger },
        });
      },
      inject: [APP_CONFIG, FACTUS_TOKEN_CACHE],
    },
    {
      provide: FACTUS_PORT,
      useFactory: (client: FactusClient) => new FactusSdkAdapter(client),
      inject: [FactusClient],
    },
  ],
  exports: [APP_CONFIG, FactusClient, FACTUS_PORT],
})
export class FactusModule {}
