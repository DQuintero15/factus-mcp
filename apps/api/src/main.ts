import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';
import { loadAppConfig } from './config/app-config.js';

async function bootstrap(): Promise<void> {
  const config = loadAppConfig();
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  app.enableCors({ origin: true });

  await app.listen(config.port, '0.0.0.0');
  new Logger('Bootstrap').log(
    `Factus MCP API escuchando en http://0.0.0.0:${config.port}/mcp (default Factus base: ${config.factusDefaultBaseUrl})`,
  );
}

void bootstrap();
