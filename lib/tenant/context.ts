import { AsyncLocalStorage } from "node:async_hooks";

type TenantStore = { tenantId: string };

const tenantStorage = new AsyncLocalStorage<TenantStore>();

/**
 * Executa `fn` com o tenant informado disponível no contexto de execução atual.
 * Toda consulta a dados de domínio feita dentro de `fn` (e suas chamadas assíncronas
 * descendentes) será automaticamente filtrada por este tenant pelo middleware do Prisma.
 *
 * Aguarda `fn()` internamente (via uma função async própria) por construção: isso é
 * necessário porque o despacho real de uma consulta do Prisma (e a leitura do tenant
 * pelo middleware em prisma-extension.ts) só ocorre quando a promise lazy retornada é
 * adotada — e essa adoção só herda corretamente o contexto do AsyncLocalStorage se
 * acontecer dentro da janela síncrona de `tenantStorage.run()`. Se `fn` fosse chamada
 * diretamente sem esse `await` interno, um chamador que escrevesse
 * `runWithTenant(id, () => prisma.model.op())` (uma arrow function comum, sem quebra
 * de função async) perderia o contexto silenciosamente — a consulta falharia com
 * `MissingTenantContextError` em vez de aplicar o isolamento. Fazer o `await` aqui
 * dentro do próprio `runWithTenant` torna esse padrão seguro independentemente de como
 * o chamador escreve `fn`, sem exigir que cada callsite lembre de fazê-lo.
 */
export function runWithTenant<T>(
  tenantId: string,
  fn: () => T | Promise<T>,
): Promise<T> {
  return tenantStorage.run(
    { tenantId },
    async () => await fn(),
  );
}

/** Retorna o tenant do contexto de execução atual, ou undefined se nenhum foi definido. */
export function getTenantId(): string | undefined {
  return tenantStorage.getStore()?.tenantId;
}
