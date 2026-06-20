import { createHash } from 'node:crypto';

import { FactusError } from './errors.js';
import type { FactusCredentials, FactusTokenResponse } from './types.js';

export interface FactusTokenCache {
  get(key: string): Promise<string | undefined>;
  set(key: string, accessToken: string, ttlSeconds: number): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface TokenManagerOptions {
  ttlSeconds: number;
  skewSeconds?: number;
  cache: FactusTokenCache;
}

export class FactusTokenManager {
  private readonly ttlSeconds: number;
  private readonly skewSeconds: number;
  private readonly cache: FactusTokenCache;

  constructor(options: TokenManagerOptions) {
    this.ttlSeconds = options.ttlSeconds;
    this.skewSeconds = options.skewSeconds ?? 60;
    this.cache = options.cache;
  }

  private cacheKey(creds: FactusCredentials): string {
    return createHash('sha256')
      .update(
        `${creds.baseUrl}|${creds.clientId}|${creds.email}|${creds.clientSecret}|${creds.password}`,
      )
      .digest('hex');
  }

  async getAccessToken(creds: FactusCredentials): Promise<string> {
    const key = this.cacheKey(creds);
    const cached = await this.cache.get(key);
    if (cached) {
      return cached;
    }

    const token = await this.requestToken(creds);
    const lifetimeSeconds = Math.min(this.ttlSeconds, token.expires_in ?? this.ttlSeconds);
    const effectiveTtlSeconds = Math.max(1, lifetimeSeconds - this.skewSeconds);
    await this.cache.set(key, token.access_token, effectiveTtlSeconds);
    return token.access_token;
  }

  async invalidate(creds: FactusCredentials): Promise<void> {
    await this.cache.delete(this.cacheKey(creds));
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
