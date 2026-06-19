import { createHash } from 'node:crypto';

import { FactusError } from './errors.js';
import type { FactusCredentials, FactusTokenResponse } from './types.js';

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

export interface TokenManagerOptions {
  ttlSeconds: number;
  skewSeconds?: number;
}

/**
 * Gestiona el OAuth password-grant de Factus con cache en memoria por credencial.
 * - La clave de cache es un hash de (baseUrl + clientId + email); NUNCA se
 *   guarda en claro ni se persiste.
 * - Solo se cachea el access_token (no el refresh_token).
 */
export class FactusTokenManager {
  private readonly cache = new Map<string, CachedToken>();
  private readonly ttlSeconds: number;
  private readonly skewSeconds: number;

  constructor(options: TokenManagerOptions) {
    this.ttlSeconds = options.ttlSeconds;
    this.skewSeconds = options.skewSeconds ?? 60;
  }

  private cacheKey(creds: FactusCredentials): string {
    return createHash('sha256')
      .update(`${creds.baseUrl}|${creds.clientId}|${creds.email}`)
      .digest('hex');
  }

  async getAccessToken(creds: FactusCredentials): Promise<string> {
    const key = this.cacheKey(creds);
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.accessToken;
    }

    const token = await this.requestToken(creds);
    const lifetimeSeconds = Math.min(this.ttlSeconds, token.expires_in ?? this.ttlSeconds);
    const expiresAt = Date.now() + Math.max(0, lifetimeSeconds - this.skewSeconds) * 1000;
    this.cache.set(key, { accessToken: token.access_token, expiresAt });
    return token.access_token;
  }

  invalidate(creds: FactusCredentials): void {
    this.cache.delete(this.cacheKey(creds));
  }

  private async requestToken(creds: FactusCredentials): Promise<FactusTokenResponse> {
    const secrets = [creds.clientSecret, creds.password, creds.clientId];
    const body = new URLSearchParams({
      grant_type: 'password',
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
      username: creds.email,
      password: creds.password,
    });

    let response: Response;
    try {
      response = await fetch(`${trimSlash(creds.baseUrl)}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body,
      });
    } catch (err) {
      throw FactusError.network(
        `No se pudo conectar con Factus para autenticar: ${(err as Error).message}`,
        secrets,
      );
    }

    const parsed = await safeJson(response);
    if (!response.ok) {
      throw FactusError.fromHttp(response.status, parsed, secrets);
    }

    const token = parsed as FactusTokenResponse;
    if (!token?.access_token) {
      throw new FactusError({
        kind: 'auth',
        message: 'Factus no devolvio un access_token valido',
      });
    }
    return token;
  }
}

async function safeJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function trimSlash(url: string): string {
  return url.replace(/\/+$/, '');
}
