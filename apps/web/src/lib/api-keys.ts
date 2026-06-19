import { createHash, randomBytes } from 'node:crypto';

import { prisma } from '@factus-mcp/db';

/**
 * Generacion y gestion de API Keys MCP. El hash usa el MISMO algoritmo que
 * `apps/api` (sha256 de la key completa), de modo que solo se persiste el hash.
 * La key plana se muestra UNA sola vez al crearla.
 */

const KEY_PREFIX = 'mcp_';

export function hashApiKey(plainKey: string): string {
  return createHash('sha256').update(plainKey).digest('hex');
}

export interface CreatedApiKey {
  id: string;
  name: string;
  plainKey: string;
  keyPrefix: string;
  createdAt: Date;
}

export async function createApiKey(userId: string, name: string): Promise<CreatedApiKey> {
  const secret = randomBytes(24).toString('hex');
  const plainKey = `${KEY_PREFIX}${secret}`;
  const keyPrefix = plainKey.slice(0, 12);
  const keyHash = hashApiKey(plainKey);

  const record = await prisma.mcpApiKey.create({
    data: { userId, name: name.trim() || 'Sin nombre', keyPrefix, keyHash },
  });

  return {
    id: record.id,
    name: record.name,
    plainKey,
    keyPrefix: record.keyPrefix,
    createdAt: record.createdAt,
  };
}

export interface ApiKeyView {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
}

export async function listApiKeys(userId: string): Promise<ApiKeyView[]> {
  return prisma.mcpApiKey.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      lastUsedAt: true,
      revokedAt: true,
      createdAt: true,
    },
  });
}

export async function revokeApiKey(userId: string, id: string): Promise<boolean> {
  const result = await prisma.mcpApiKey.updateMany({
    where: { id, userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return result.count > 0;
}
