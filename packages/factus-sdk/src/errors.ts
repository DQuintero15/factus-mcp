import { redactSecretsInString } from '@factus-mcp/shared';

export type FactusErrorKind =
  | 'auth'
  | 'validation'
  | 'not_found'
  | 'rate_limited'
  | 'server'
  | 'network'
  | 'unknown';

/**
 * Error normalizado y seguro para exponer al MCP. Nunca contiene secretos.
 * `kind` permite al breaker decidir si cuenta como fallo (network/server) o no
 * (validation/auth/not_found) — regla §3.2.
 */
export class FactusError extends Error {
  readonly kind: FactusErrorKind;
  readonly status?: number;
  readonly details?: unknown;

  constructor(params: {
    kind: FactusErrorKind;
    message: string;
    status?: number;
    details?: unknown;
  }) {
    super(params.message);
    this.name = 'FactusError';
    this.kind = params.kind;
    this.status = params.status;
    this.details = params.details;
  }

  get countsAsBreakerFailure(): boolean {
    return this.kind === 'network' || this.kind === 'server';
  }

  static fromHttp(status: number, body: unknown, secrets: Array<string | undefined>): FactusError {
    const kind: FactusErrorKind =
      status === 401 || status === 403
        ? 'auth'
        : status === 404
          ? 'not_found'
          : status === 422 || status === 400
            ? 'validation'
            : status === 429
              ? 'rate_limited'
              : status >= 500
                ? 'server'
                : 'unknown';

    const rawMessage = extractMessage(body) ?? `Factus respondio HTTP ${status}`;
    return new FactusError({
      kind,
      status,
      message: redactSecretsInString(rawMessage, secrets),
      details: sanitizeDetails(body),
    });
  }

  static network(message: string, secrets: Array<string | undefined> = []): FactusError {
    return new FactusError({
      kind: 'network',
      message: redactSecretsInString(message, secrets),
    });
  }
}

function extractMessage(body: unknown): string | undefined {
  if (typeof body === 'string') return body;
  if (body && typeof body === 'object') {
    const b = body as Record<string, unknown>;
    if (typeof b.message === 'string') return b.message;
    if (typeof b.error === 'string') return b.error;
    if (b.error && typeof b.error === 'object') {
      const e = b.error as Record<string, unknown>;
      if (typeof e.message === 'string') return e.message;
    }
  }
  return undefined;
}

/** Devuelve solo los errores de validacion utiles, sin reflejar el payload completo. */
function sanitizeDetails(body: unknown): unknown {
  if (body && typeof body === 'object') {
    const b = body as Record<string, unknown>;
    if (b.errors) return b.errors;
    if (b.data && typeof b.data === 'object') return b.data;
  }
  return undefined;
}
