import { randomUUID } from 'node:crypto';

import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { Controller, Delete, Get, Inject, Logger, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';

import type { FactusPort } from '@factus-mcp/core';
import { runWithFactusLogContext } from '@factus-mcp/factus-sdk';

import { ApiKeyGuard } from '../auth/api-key.guard.js';
import { APP_CONFIG, FACTUS_PORT, type AppConfig } from '../config/app-config.js';
import { extractFactusCredentials } from '../factus/credentials.js';
import { createMcpServer } from './mcp-server.factory.js';
import type { ToolContext } from './tools.js';

@Controller('mcp')
@UseGuards(ApiKeyGuard)
export class McpController {
  private readonly logger = new Logger(McpController.name);

  constructor(
    @Inject(FACTUS_PORT) private readonly port: FactusPort,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  @Post()
  async handlePost(@Req() req: Request, @Res() res: Response): Promise<void> {
    const requestId = getRequestId(req);
    const startedAt = Date.now();
    const path = getSafePath(req);

    res.setHeader('x-request-id', requestId);
    this.logger.log(
      JSON.stringify({
        event: 'mcp_request_received',
        requestId,
        method: req.method,
        path,
      }),
    );

    res.on('finish', () => {
      this.logger.log(
        JSON.stringify({
          event: 'mcp_request_completed',
          requestId,
          method: req.method,
          path,
          durationMs: Date.now() - startedAt,
          statusCode: res.statusCode,
        }),
      );
    });

    const ctx: ToolContext = {
      port: this.port,
      logger: this.logger,
      requestId,
      getCredentials: () => extractFactusCredentials(req.headers, this.config.factusDefaultBaseUrl),
    };

    const server = createMcpServer(ctx);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    res.on('close', () => {
      void transport.close();
      void server.close();
    });

    try {
      await runWithFactusLogContext({ requestId }, async () => {
        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
      });
    } catch (err) {
      this.logger.error(
        JSON.stringify({
          event: 'mcp_request_failed',
          requestId,
          method: req.method,
          path,
          durationMs: Date.now() - startedAt,
          errorType: err instanceof Error ? err.name : 'unknown',
        }),
      );
      throw err;
    }
  }

  @Get()
  handleGet(@Res() res: Response): void {
    methodNotAllowed(res);
  }

  @Delete()
  handleDelete(@Res() res: Response): void {
    methodNotAllowed(res);
  }
}

function getRequestId(req: Request): string {
  const value = req.headers['x-request-id'] ?? req.headers['x-correlation-id'];
  if (Array.isArray(value)) return value[0] || randomUUID();
  return value || randomUUID();
}

function getSafePath(req: Request): string {
  return (req.originalUrl || req.path || '/mcp').split('?')[0] || '/mcp';
}

function methodNotAllowed(res: Response): void {
  res.status(405).json({
    jsonrpc: '2.0',
    error: {
      code: -32000,
      message: 'Method not allowed: el servidor MCP es stateless (usa POST).',
    },
    id: null,
  });
}
