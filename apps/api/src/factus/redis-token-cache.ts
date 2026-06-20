import type { OnApplicationShutdown } from '@nestjs/common';
import { createClient } from 'redis';

import type { FactusTokenCache } from '@factus-mcp/factus-sdk';

interface RedisTokenClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options: { EX: number }): Promise<unknown>;
  del(key: string): Promise<number>;
  quit(): Promise<unknown>;
}

export interface RedisTokenCacheOptions {
  url: string;
  keyPrefix: string;
  onError?: (err: Error) => void;
}

export class RedisTokenCache implements FactusTokenCache, OnApplicationShutdown {
  constructor(
    private readonly client: RedisTokenClient,
    private readonly keyPrefix: string,
  ) {}

  async get(key: string): Promise<string | undefined> {
    return (await this.client.get(this.redisKey(key))) ?? undefined;
  }

  async set(key: string, accessToken: string, ttlSeconds: number): Promise<void> {
    await this.client.set(this.redisKey(key), accessToken, {
      EX: Math.max(1, Math.floor(ttlSeconds)),
    });
  }

  async delete(key: string): Promise<void> {
    await this.client.del(this.redisKey(key));
  }

  async onApplicationShutdown(): Promise<void> {
    await this.client.quit();
  }

  private redisKey(key: string): string {
    return `${this.keyPrefix}:factus-token:${key}`;
  }
}

export async function createRedisTokenCache(
  options: RedisTokenCacheOptions,
): Promise<RedisTokenCache> {
  const client = createClient({ url: options.url });
  if (options.onError) {
    client.on('error', options.onError);
  }
  await client.connect();
  return new RedisTokenCache(client as unknown as RedisTokenClient, options.keyPrefix);
}
