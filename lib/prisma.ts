import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";
import { tenantScopingExtension } from "./tenant/prisma-extension";

const globalForPrisma = globalThis as unknown as {
  basePrisma?: PrismaClient;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: 3,
});

const basePrisma = globalForPrisma.basePrisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.basePrisma = basePrisma;
}

/**
 * Cliente Prisma padrão da aplicação. Toda consulta a um modelo com campo `tenantId`
 * é automaticamente filtrada pelo tenant do contexto atual (ver lib/tenant/context.ts).
 * Nunca importe `PrismaClient` diretamente para acessar dados de domínio — use este cliente.
 */
export const prisma = basePrisma.$extends(tenantScopingExtension);
