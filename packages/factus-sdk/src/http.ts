import { AsyncLocalStorage } from 'node:async_hooks';

import {
  circuitBreaker,
  ConsecutiveBreaker,
  ExponentialBackoff,
  handleWhen,
  retry,
  timeout,
  TimeoutStrategy,
  wrap,
  type IPolicy,
} from 'cockatiel';

import { FactusError } from './errors.js';

export interface HttpClientOptions {
  timeoutMs?: number;
  retries?: number;
  breakerThreshold?: number;
  breakerHalfOpenAfterMs?: number;
  logger?: FactusHttpLogger;
}

export interface FactusHttpLogger {
  log(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export interface FactusLogContext {
  requestId?: string;
}

const logContextStorage = new AsyncLocalStorage<FactusLogContext>();

export async function runWithFactusLogContext<T>(
  context: FactusLogContext,
  fn: () => Promise<T>,
): Promise<T> {
  return logContextStorage.run(context, fn);
}

export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  accessToken: string;
  baseUrl: string;
  query?: Record<string, string | number | undefined>;
  body?: unknown;
  secrets?: Array<string | undefined>;
}

export class FactusHttpClient {
  private readonly policy: IPolicy;

  constructor(private readonly options: HttpClientOptions = {}) {
    const onlyTransient = handleWhen(
      (err) => err instanceof FactusError && err.countsAsBreakerFailure,
    );

    const timeoutPolicy = timeout(options.timeoutMs ?? 15_000, TimeoutStrategy.Aggressive);
    const retryPolicy = retry(onlyTransient, {
      maxAttempts: options.retries ?? 2,
      backoff: new ExponentialBackoff({ initialDelay: 250, maxDelay: 2_000 }),
    });
    const breakerPolicy = circuitBreaker(onlyTransient, {
      halfOpenAfter: options.breakerHalfOpenAfterMs ?? 10_000,
      breaker: new ConsecutiveBreaker(options.breakerThreshold ?? 5),
    });

    this.policy = wrap(breakerPolicy, retryPolicy, timeoutPolicy);
  }

  async request<T>(opts: RequestOptions): Promise<T> {
    return this.policy.execute(() => this.rawRequest<T>(opts));
  }

  private async rawRequest<T>(opts: RequestOptions): Promise<T> {
    const url = buildUrl(opts.baseUrl, opts.path, opts.query);
    const path = sanitizeFactusPath(opts.path);
    const secrets = opts.secrets ?? [];
    const startedAt = Date.now();
    const requestId = logContextStorage.getStore()?.requestId;

    this.options.logger?.log(
      JSON.stringify({
        event: 'factus_request_started',
        requestId,
        method: opts.method,
        path,
      }),
    );

    const headers: Record<string, string> = {
      Accept: 'application/json',
      Authorization: `Bearer ${opts.accessToken}`,
    };
    let payload: string | undefined;
    if (opts.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(opts.body);
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method: opts.method,
        headers,
        body: payload,
      });
    } catch (err) {
      this.options.logger?.error(
        JSON.stringify({
          event: 'factus_request_failed',
          requestId,
          method: opts.method,
          path,
          durationMs: Date.now() - startedAt,
          errorType: 'network',
        }),
      );
      throw FactusError.network(`Error de red llamando a Factus: ${(err as Error).message}`, [
        ...secrets,
        opts.accessToken,
      ]);
    }

    const parsed = await safeJson(response);
    if (!response.ok) {
      this.options.logger?.warn(
        JSON.stringify({
          event: 'factus_request_failed',
          requestId,
          method: opts.method,
          path,
          durationMs: Date.now() - startedAt,
          statusCode: response.status,
          errorType: classifyStatus(response.status),
        }),
      );
      throw FactusError.fromHttp(response.status, parsed, [...secrets, opts.accessToken]);
    }
    this.options.logger?.log(
      JSON.stringify({
        event: 'factus_request_succeeded',
        requestId,
        method: opts.method,
        path,
        durationMs: Date.now() - startedAt,
        statusCode: response.status,
      }),
    );
    return parsed as T;
  }
}

function classifyStatus(status: number): string {
  if (status === 401 || status === 403) return 'auth';
  if (status === 404) return 'not_found';
  if (status === 400 || status === 422) return 'validation';
  if (status === 429) return 'rate_limited';
  if (status >= 500) return 'server';
  return 'unknown';
}

function sanitizeFactusPath(path: string): string {
  return path
    .replace(/\/v2\/bills\/[^/]+\/download-pdf$/, '/v2/bills/:number/download-pdf')
    .replace(/\/v2\/bills\/[^/]+\/download-xml$/, '/v2/bills/:number/download-xml')
    .replace(/\/v2\/bills\/[^/]+\/send-email$/, '/v2/bills/:number/send-email')
    .replace(/\/v2\/bills\/[^/]+$/, '/v2/bills/:number');
}

function buildUrl(
  baseUrl: string,
  path: string,
  query?: Record<string, string | number | undefined>,
): string {
  const base = baseUrl.replace(/\/+$/, '');
  const rel = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${base}${rel}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
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
