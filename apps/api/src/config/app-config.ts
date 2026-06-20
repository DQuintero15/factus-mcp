import { z } from 'zod';

export interface AppConfig {
  port: number;
  factusDefaultBaseUrl: string;
  factusTokenTtlSeconds: number;
  redisUrl: string;
  redisKeyPrefix: string;
}

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().max(65_535).default(3000),
  FACTUS_DEFAULT_BASE_URL: z.string().url().default('https://api-sandbox.factus.com.co'),
  FACTUS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(3000),
  REDIS_URL: z
    .string({ required_error: 'REDIS_URL es requerido' })
    .url('REDIS_URL debe ser una URL valida')
    .refine(isRedisUrl, 'REDIS_URL debe usar protocolo redis: o rediss:'),
  REDIS_KEY_PREFIX: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9:_-]{1,64}$/, 'REDIS_KEY_PREFIX solo admite letras, numeros, :, _ y -')
    .default('factus-mcp'),
});

export function loadAppConfig(): AppConfig {
  const env = envSchema.parse({
    PORT: process.env.PORT,
    FACTUS_DEFAULT_BASE_URL: process.env.FACTUS_DEFAULT_BASE_URL,
    FACTUS_TOKEN_TTL_SECONDS: process.env.FACTUS_TOKEN_TTL_SECONDS,
    REDIS_URL: process.env.REDIS_URL,
    REDIS_KEY_PREFIX: process.env.REDIS_KEY_PREFIX,
  });

  return {
    port: env.PORT,
    factusDefaultBaseUrl: env.FACTUS_DEFAULT_BASE_URL,
    factusTokenTtlSeconds: env.FACTUS_TOKEN_TTL_SECONDS,
    redisUrl: env.REDIS_URL,
    redisKeyPrefix: env.REDIS_KEY_PREFIX,
  };
}

function isRedisUrl(value: string): boolean {
  try {
    const protocol = new URL(value).protocol;
    return protocol === 'redis:' || protocol === 'rediss:';
  } catch {
    return false;
  }
}

export const APP_CONFIG = Symbol('APP_CONFIG');
export const FACTUS_PORT = Symbol('FACTUS_PORT');
export const FACTUS_TOKEN_CACHE = Symbol('FACTUS_TOKEN_CACHE');
