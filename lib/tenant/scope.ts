/**
 * Regras de acesso do isolamento multi-tenant: dado uma operação do Prisma sobre um modelo
 * tenant-scoped, produz os argumentos filtrados/injetados pelo tenant do contexto atual,
 * ou lança um erro quando o contexto está ausente ou em conflito com o tenant solicitado.
 *
 * Mantido como função pura (sem dependência do Prisma Client) para ser testável isoladamente.
 */

const OPERATIONS_WITH_WHERE = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "update",
  "updateMany",
  "upsert",
  "delete",
  "deleteMany",
  "count",
  "aggregate",
  "groupBy",
]);

export class MissingTenantContextError extends Error {
  constructor(model: string) {
    super(
      `Operação em "${model}" exige um tenant no contexto de execução, mas nenhum foi encontrado.`,
    );
    this.name = "MissingTenantContextError";
  }
}

export class TenantMismatchError extends Error {
  constructor(model: string) {
    super(
      `A operação em "${model}" tentou acessar ou gravar dados de um tenant diferente do contexto atual.`,
    );
    this.name = "TenantMismatchError";
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Args = Record<string, any>;

export function scopeQueryArgs(
  model: string,
  operation: string,
  args: Args | undefined,
  tenantId: string | undefined,
): Args {
  if (!tenantId) {
    throw new MissingTenantContextError(model);
  }

  const scopedArgs: Args = { ...(args ?? {}) };

  if (operation === "create") {
    scopedArgs.data = injectTenantIntoData(scopedArgs.data, tenantId, model);
    return scopedArgs;
  }

  if (operation === "createMany") {
    const data = Array.isArray(scopedArgs.data)
      ? scopedArgs.data
      : [scopedArgs.data];
    scopedArgs.data = data.map((record: Args) =>
      injectTenantIntoData(record, tenantId, model),
    );
    return scopedArgs;
  }

  if (operation === "upsert") {
    scopedArgs.where = scopeWhere(scopedArgs.where, tenantId, model);
    scopedArgs.create = injectTenantIntoData(
      scopedArgs.create,
      tenantId,
      model,
    );
    if (
      scopedArgs.update?.tenantId !== undefined &&
      scopedArgs.update.tenantId !== tenantId
    ) {
      throw new TenantMismatchError(model);
    }
    return scopedArgs;
  }

  if (OPERATIONS_WITH_WHERE.has(operation)) {
    scopedArgs.where = scopeWhere(scopedArgs.where, tenantId, model);
  }

  if (
    (operation === "update" || operation === "updateMany") &&
    scopedArgs.data?.tenantId !== undefined &&
    scopedArgs.data.tenantId !== tenantId
  ) {
    throw new TenantMismatchError(model);
  }

  return scopedArgs;
}

function injectTenantIntoData(
  data: Args | undefined,
  tenantId: string,
  model: string,
): Args {
  const record: Args = { ...(data ?? {}) };
  if (record.tenantId !== undefined && record.tenantId !== tenantId) {
    throw new TenantMismatchError(model);
  }
  record.tenantId = tenantId;
  return record;
}

function scopeWhere(
  where: Args | undefined,
  tenantId: string,
  model: string,
): Args {
  const scoped: Args = { ...(where ?? {}) };
  if (scoped.tenantId !== undefined && scoped.tenantId !== tenantId) {
    throw new TenantMismatchError(model);
  }
  scoped.tenantId = tenantId;
  return scoped;
}
