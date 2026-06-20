import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ZodError } from 'zod';

import { FactusError } from '@factus-mcp/factus-sdk';

import { MissingFactusCredentialsError } from '../factus/credentials.js';
import { TOOL_DEFINITIONS, type ToolContext } from './tools.js';

const SERVER_INFO = { name: 'factus-mcp', version: '0.1.0' } as const;

const FACTUS_MCP_INSTRUCTIONS = `You are an MCP bridge for Factus API V2 (electronic invoicing for DIAN Colombia).

General rules:

- Never invent, infer, guess, default, autofill, autocomplete, estimate, generate, or select fiscal, legal, accounting, customer, product, payment, tax, catalog, authorization, or numbering data.
- If any required field is missing, stop and ask for it.
- Do not call any write operation until all required data has been explicitly provided by the user or obtained from a catalog/tool.
- Do not assume that a single available value is correct. Always ask the user to choose unless the user explicitly provided the value.
- Treat all invoicing operations as high-impact fiscal actions.
Supported fiscal operations:

- Create, read, list, and delete unvalidated invoices, credit notes, support documents, and adjustment notes when tools expose the operation.
- Use get_document_file for PDF, XML, and attached-document XML metadata/references. Do not request or expose raw base64 through MCP output.
- attached_document_xml is only valid for bills and credit notes.
Critical fields that MUST NEVER be inferred:

- numbering_range_id
- operation_type
- customer identification
- customer document type
- customer tax responsibility
- municipality
- payment form
- payment method
- invoice items
- taxes
- unit measures
- standard codes
- quantities
- prices
- discounts
- invoice dates
Catalog usage:

- When a field depends on a Factus catalog, consult the corresponding catalog tool first.
- Never fabricate catalog identifiers.
- Never map human-readable values to catalog ids without verifying them through a catalog tool.
- If multiple catalog values are valid candidates, present the options and ask the user to choose.
Document creation workflow:

1. Gather required information.
2. Validate completeness.
3. Resolve catalog values using tools.
4. Display a structured document summary.
5. Ask for explicit confirmation.
6. Only after confirmation, call the create tool.
Confirmation requirement:

Before create_invoice, create_credit_note, create_support_document, or create_adjustment_note, always display:

- Numbering range
- Customer information
- Provider information, when applicable
- Payment information
- Products/services
- Taxes
- Totals
Then ask:

"Please confirm that this fiscal document should be issued."

Only proceed when the user provides an explicit affirmative confirmation such as:

- Confirm
- Yes, issue the document
- Create document
- Proceed
Do not interpret unrelated messages as confirmation.

Numbering ranges:

- Never select a numbering range automatically.
- Never choose the first available numbering range.
- Never choose the only available numbering range.
- Always ask the user which numbering range should be used.
- If numbering ranges are available, display them and require user selection.
Safety:

- Creating invoices, credit notes, support documents, adjustment notes, RADIAN events, or any DIAN-reportable document always requires explicit confirmation.
- Deleting unvalidated fiscal documents is destructive and always requires explicit confirmation.
- Read-only operations do not require confirmation.`;

export function createMcpServer(ctx: ToolContext): McpServer {
  const server = new McpServer(SERVER_INFO, {
    instructions: FACTUS_MCP_INSTRUCTIONS,
  });

  for (const tool of TOOL_DEFINITIONS) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema,
      },
      async (args: unknown) => {
        const startedAt = Date.now();
        ctx.logger?.log(
          JSON.stringify({
            event: 'mcp_tool_called',
            requestId: ctx.requestId,
            toolName: tool.name,
            requiresFactus: tool.requiresFactus,
          }),
        );

        try {
          const result = await tool.handler(args, ctx);
          ctx.logger?.log(
            JSON.stringify({
              event: 'mcp_tool_completed',
              requestId: ctx.requestId,
              toolName: tool.name,
              durationMs: Date.now() - startedAt,
              resultCategory: getResultCategory(result),
            }),
          );
          return {
            content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
          };
        } catch (err) {
          logToolError(err, ctx, tool.name, startedAt);
          return {
            isError: true,
            content: [{ type: 'text' as const, text: toSafeErrorMessage(err) }],
          };
        }
      },
    );
  }

  return server;
}

function logToolError(err: unknown, ctx: ToolContext, toolName: string, startedAt: number): void {
  if (err instanceof ZodError) {
    const missingFieldPaths = err.issues
      .filter((issue) => issue.code === 'invalid_type' && issue.received === 'undefined')
      .map((issue) => issue.path.join('.') || '(root)');
    const unsupportedFieldPaths = err.issues.flatMap((issue) => {
      if (issue.code !== 'unrecognized_keys') return [];
      const base = issue.path.join('.');
      return issue.keys.map((key) => (base ? `${base}.${key}` : key));
    });

    if (unsupportedFieldPaths.length > 0) {
      ctx.logger?.warn(
        JSON.stringify({
          event: 'mcp_unsupported_fields_rejected',
          requestId: ctx.requestId,
          toolName,
          durationMs: Date.now() - startedAt,
          unsupportedFieldPaths,
        }),
      );
    }

    ctx.logger?.warn(
      JSON.stringify({
        event: 'mcp_validation_failed',
        requestId: ctx.requestId,
        toolName,
        durationMs: Date.now() - startedAt,
        missingFieldPaths,
        issueCount: err.issues.length,
      }),
    );
    return;
  }

  if (err instanceof FactusError) {
    ctx.logger?.warn(
      JSON.stringify({
        event: 'mcp_tool_failed',
        requestId: ctx.requestId,
        toolName,
        durationMs: Date.now() - startedAt,
        errorType: 'FactusError',
        errorCode: err.kind,
        statusCode: err.status,
      }),
    );
    return;
  }

  ctx.logger?.error(
    JSON.stringify({
      event: 'mcp_tool_failed',
      requestId: ctx.requestId,
      toolName,
      durationMs: Date.now() - startedAt,
      errorType: err instanceof Error ? err.name : 'unknown',
    }),
  );
}

function getResultCategory(result: unknown): string {
  if (result && typeof result === 'object' && 'source' in result) {
    const source = (result as { source?: unknown }).source;
    if (source === 'factus' || source === 'catalog') return source;
  }
  return 'unknown';
}

function toSafeErrorMessage(err: unknown): string {
  if (err instanceof MissingFactusCredentialsError) {
    return err.message;
  }
  if (err instanceof ZodError) {
    const issues = err.issues
      .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('; ');
    return `Error de validacion de entrada: ${issues}`;
  }
  if (err instanceof FactusError) {
    const detail = err.details ? ` Detalle: ${JSON.stringify(err.details)}` : '';
    return `Error Factus (${err.kind}${err.status ? ` ${err.status}` : ''}): ${err.message}.${detail}`;
  }
  return 'Ocurrio un error procesando la operacion.';
}
