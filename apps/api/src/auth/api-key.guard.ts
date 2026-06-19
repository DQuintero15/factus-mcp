import {
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import type { Request } from 'express';

import { ApiKeyService } from './api-key.service.js';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeys: ApiKeyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { mcpApiKey?: unknown }>();
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Falta el header Authorization: Bearer mcp_...');
    }

    const token = authHeader.slice('Bearer '.length).trim();
    const verified = await this.apiKeys.verify(token);
    if (!verified) {
      throw new UnauthorizedException('API Key MCP invalida o revocada');
    }

    req.mcpApiKey = verified;
    return true;
  }
}
