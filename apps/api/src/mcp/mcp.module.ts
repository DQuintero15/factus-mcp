import { Module } from '@nestjs/common';

import { ApiKeyGuard } from '../auth/api-key.guard.js';
import { ApiKeyService } from '../auth/api-key.service.js';
import { McpController } from './mcp.controller.js';

@Module({
  controllers: [McpController],
  providers: [ApiKeyService, ApiKeyGuard],
})
export class McpModule {}
