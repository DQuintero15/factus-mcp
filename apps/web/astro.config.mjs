import node from '@astrojs/node';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';

// Panel del MCP: SSR (Better Auth + paneles protegidos) sobre el adaptador Node.
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [tailwind()],
  server: { host: true, port: Number(process.env.PORT ?? 4321) },
  vite: {
    ssr: {
      // No bundlear Prisma ni el paquete db: el cliente generado referencia
      // ".prisma/client/default", que solo resuelve desde node_modules en runtime.
      external: ['@factus-mcp/db', '@prisma/client', '@prisma/adapter-pg', 'pg'],
    },
  },
});
