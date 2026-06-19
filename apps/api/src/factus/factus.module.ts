import { Global, Logger, Module } from '@nestjs/common';

import { FactusSdkAdapter } from '@factus-mcp/core';
import { FactusClient } from '@factus-mcp/factus-sdk';

import { APP_CONFIG, FACTUS_PORT, loadAppConfig, type AppConfig } from '../config/app-config.js';

@Global()
@Module({
  providers: [
    {
      provide: APP_CONFIG,
      useFactory: loadAppConfig,
    },
    {
      provide: FactusClient,
      useFactory: (config: AppConfig) => {
        const logger = new Logger('FactusHttpClient');
        return new FactusClient({
          tokenTtlSeconds: config.factusTokenTtlSeconds,
          http: { logger },
        });
      },
      inject: [APP_CONFIG],
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
