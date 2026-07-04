/**
 * Lista explícita dos modelos Prisma isolados por tenant (possuem campo `tenantId`
 * e são filtrados automaticamente pelo middleware em lib/tenant/prisma-extension.ts).
 *
 * Ao adicionar uma nova tabela de domínio vinculada a uma conta (ex: aves, ninhadas),
 * adicione o `tenantId` ao modelo no schema Prisma E o nome do modelo aqui — sem isso,
 * o isolamento multi-tenant não é aplicado à tabela.
 */
export const TENANT_SCOPED_MODELS = new Set<string>(["Ave", "Ninhada"]);
