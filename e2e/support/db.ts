import { randomUUID } from "node:crypto";
import { Client } from "pg";

/**
 * Acesso direto via `pg` (em vez do client Prisma gerado) porque o runner de
 * testes do Playwright não consegue transpilar o `import.meta` usado pelo
 * client gerado do Prisma 7 — o Vitest lida com isso via Vite, o Playwright não.
 *
 * Uma única conexão é reaproveitada durante toda a suíte (aberta/fechada
 * explicitamente por `abrirConexao`/`fecharConexao`) em vez de abrir uma nova
 * a cada chamada — o pooler do Supabase tem `pool_size: 15`, compartilhado
 * com a aplicação em produção, e abrir várias conexões extras por execução
 * de teste aumenta a chance de esgotá-lo.
 */
let client: Client | null = null;

export async function abrirConexao(): Promise<void> {
  client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
}

export async function fecharConexao(): Promise<void> {
  await client?.end();
  client = null;
}

function conexaoAtiva(): Client {
  if (!client) {
    throw new Error("Conexão não aberta — chame abrirConexao() antes.");
  }
  return client;
}

export async function garantirEspecie(nome: string): Promise<{ id: string; nome: string }> {
  const db = conexaoAtiva();
  const existente = await db.query('SELECT id, nome FROM "Especie" WHERE nome = $1', [nome]);
  if (existente.rows[0]) {
    return existente.rows[0] as { id: string; nome: string };
  }
  const id = randomUUID();
  await db.query('INSERT INTO "Especie" (id, nome) VALUES ($1, $2)', [id, nome]);
  return { id, nome };
}

export async function excluirEspecies(ids: string[]): Promise<void> {
  await conexaoAtiva().query('DELETE FROM "Especie" WHERE id = ANY($1)', [ids]);
}

export async function buscarTenantPorOwnerId(ownerId: string): Promise<{ id: string } | null> {
  const res = await conexaoAtiva().query('SELECT id FROM "Tenant" WHERE "ownerId" = $1', [
    ownerId,
  ]);
  return (res.rows[0] as { id: string } | undefined) ?? null;
}

export async function limparTenant(tenantId: string): Promise<void> {
  const db = conexaoAtiva();
  await db.query('DELETE FROM "Ninhada" WHERE "tenantId" = $1', [tenantId]);
  await db.query('DELETE FROM "Ave" WHERE "tenantId" = $1', [tenantId]);
  await db.query('DELETE FROM "Tenant" WHERE id = $1', [tenantId]);
}
