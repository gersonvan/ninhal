import { AsyncLocalStorage } from "node:async_hooks";

type TenantStore = { tenantId: string };

const tenantStorage = new AsyncLocalStorage<TenantStore>();

/**
 * Executa `fn` com o tenant informado disponível no contexto de execução atual.
 * Toda consulta a dados de domínio feita dentro de `fn` (e suas chamadas assíncronas
 * descendentes) será automaticamente filtrada por este tenant pelo middleware do Prisma.
 */
export function runWithTenant<T>(tenantId: string, fn: () => T): T {
  return tenantStorage.run({ tenantId }, fn);
}

/** Retorna o tenant do contexto de execução atual, ou undefined se nenhum foi definido. */
export function getTenantId(): string | undefined {
  return tenantStorage.getStore()?.tenantId;
}
