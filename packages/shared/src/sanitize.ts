export const SENSITIVE_KEYS: readonly string[] = [
  'access_token',
  'refresh_token',
  'client_secret',
  'client_id',
  'password',
  'apikey',
  'api_key',
  'authorization',
  'token',
  'secret',
];

const REDACTED = '[REDACTED]';

function isSensitiveKey(key: string): boolean {
  const k = key.toLowerCase();
  return SENSITIVE_KEYS.includes(k);
}

export function sanitizeDeep<T>(value: T, seen = new WeakSet<object>()): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (seen.has(value as object)) {
    return undefined as unknown as T;
  }
  seen.add(value as object);

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeDeep(item, seen)) as unknown as T;
  }

  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    out[key] = isSensitiveKey(key) ? REDACTED : sanitizeDeep(val, seen);
  }
  return out as unknown as T;
}

export function redactSecretsInString(text: string, secrets: Array<string | undefined>): string {
  let result = text;
  for (const secret of secrets) {
    if (secret && secret.length >= 4) {
      result = result.split(secret).join(REDACTED);
    }
  }
  return result;
}
