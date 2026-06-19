import path from 'node:path';

import { defineConfig, env } from 'prisma/config';

/**
 * Configuracion de Prisma 7. En v7 la URL de conexion ya no vive en
 * schema.prisma; se define aqui (para CLI/Migrate) y en runtime se pasa un
 * driver adapter al PrismaClient (ver src/index.ts).
 */
export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
