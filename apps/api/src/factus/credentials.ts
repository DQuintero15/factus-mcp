import type { IncomingHttpHeaders } from 'node:http';

import type { FactusCredentials } from '@factus-mcp/factus-sdk';

export const FACTUS_HEADERS = {
  baseUrl: 'x-factus-base-url',
  clientId: 'x-factus-client-id',
  clientSecret: 'x-factus-client-secret',
  email: 'x-factus-email',
  password: 'x-factus-password',
} as const;

export class MissingFactusCredentialsError extends Error {
  constructor(missing: string[]) {
    super(
      `Faltan credenciales Factus en los headers: ${missing.join(', ')}. ` +
        `Esta tool requiere x-factus-client-id, x-factus-client-secret, x-factus-email y x-factus-password.`,
    );
    this.name = 'MissingFactusCredentialsError';
  }
}

function header(headers: IncomingHttpHeaders, name: string): string | undefined {
  const value = headers[name];
  if (Array.isArray(value)) return value[0];
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
}

export function extractFactusCredentials(
  headers: IncomingHttpHeaders,
  defaultBaseUrl: string,
): FactusCredentials {
  const clientId = header(headers, FACTUS_HEADERS.clientId);
  const clientSecret = header(headers, FACTUS_HEADERS.clientSecret);
  const email = header(headers, FACTUS_HEADERS.email);
  const password = header(headers, FACTUS_HEADERS.password);

  const missing: string[] = [];
  if (!clientId) missing.push(FACTUS_HEADERS.clientId);
  if (!clientSecret) missing.push(FACTUS_HEADERS.clientSecret);
  if (!email) missing.push(FACTUS_HEADERS.email);
  if (!password) missing.push(FACTUS_HEADERS.password);
  if (missing.length > 0) {
    throw new MissingFactusCredentialsError(missing);
  }

  return {
    baseUrl: header(headers, FACTUS_HEADERS.baseUrl) ?? defaultBaseUrl,
    clientId: clientId as string,
    clientSecret: clientSecret as string,
    email: email as string,
    password: password as string,
  };
}
