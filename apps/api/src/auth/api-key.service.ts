import { createHash } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import { prisma } from '@factus-mcp/db';

export interface VerifiedApiKey {
  id: string;
  userId: string;
}

@Injectable()
export class ApiKeyService {
  static hash(plainKey: string): string {
    return createHash('sha256').update(plainKey).digest('hex');
  }

  async verify(plainKey: string): Promise<VerifiedApiKey | null> {
    if (!plainKey.startsWith('mcp_')) return null;

    const keyHash = ApiKeyService.hash(plainKey);
    const record = await prisma.mcpApiKey.findUnique({ where: { keyHash } });
    if (!record || record.revokedAt) return null;

    void prisma.mcpApiKey
      .update({ where: { id: record.id }, data: { lastUsedAt: new Date() } })
      .catch(() => undefined);

    return { id: record.id, userId: record.userId };
  }
}
