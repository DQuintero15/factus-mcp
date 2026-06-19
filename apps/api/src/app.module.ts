import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { FactusModule } from './factus/factus.module.js';
import { HealthController } from './health.controller.js';
import { McpModule } from './mcp/mcp.module.js';

@Module({
  imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]), FactusModule, McpModule],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
