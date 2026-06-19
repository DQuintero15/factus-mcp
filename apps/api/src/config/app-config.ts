export interface AppConfig {
  port: number;
  factusDefaultBaseUrl: string;
  factusTokenTtlSeconds: number;
}

export function loadAppConfig(): AppConfig {
  return {
    port: parseInt(process.env.PORT ?? '3000', 10),
    factusDefaultBaseUrl:
      process.env.FACTUS_DEFAULT_BASE_URL ?? 'https://api-sandbox.factus.com.co',
    factusTokenTtlSeconds: parseInt(process.env.FACTUS_TOKEN_TTL_SECONDS ?? '3000', 10),
  };
}

export const APP_CONFIG = Symbol('APP_CONFIG');
export const FACTUS_PORT = Symbol('FACTUS_PORT');
