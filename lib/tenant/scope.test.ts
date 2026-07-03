import { describe, expect, it } from "vitest";
import {
  MissingTenantContextError,
  TenantMismatchError,
  scopeQueryArgs,
} from "./scope";

const TENANT_A = "tenant-a";
const TENANT_B = "tenant-b";

describe("scopeQueryArgs", () => {
  it("bloqueia qualquer operação quando não há tenant no contexto", () => {
    expect(() => scopeQueryArgs("Bird", "findMany", {}, undefined)).toThrow(
      MissingTenantContextError,
    );
    expect(() => scopeQueryArgs("Bird", "create", { data: {} }, undefined)).toThrow(
      MissingTenantContextError,
    );
  });

  it("injeta o tenant do contexto no where de uma leitura, garantindo acesso apenas aos dados da própria tenant", () => {
    const scoped = scopeQueryArgs(
      "Bird",
      "findMany",
      { where: { name: "Piu" } },
      TENANT_A,
    );
    expect(scoped.where).toEqual({ name: "Piu", tenantId: TENANT_A });
  });

  it("injeta o tenant do contexto quando não há where original", () => {
    const scoped = scopeQueryArgs("Bird", "findMany", {}, TENANT_A);
    expect(scoped.where).toEqual({ tenantId: TENANT_A });
  });

  it("bloqueia a leitura quando o where solicita explicitamente uma tenant diferente", () => {
    expect(() =>
      scopeQueryArgs(
        "Bird",
        "findMany",
        { where: { tenantId: TENANT_B } },
        TENANT_A,
      ),
    ).toThrow(TenantMismatchError);
  });

  it("injeta o tenant do contexto ao criar um registro", () => {
    const scoped = scopeQueryArgs(
      "Bird",
      "create",
      { data: { name: "Piu" } },
      TENANT_A,
    );
    expect(scoped.data).toEqual({ name: "Piu", tenantId: TENANT_A });
  });

  it("bloqueia a criação de um registro para outra tenant", () => {
    expect(() =>
      scopeQueryArgs(
        "Bird",
        "create",
        { data: { name: "Piu", tenantId: TENANT_B } },
        TENANT_A,
      ),
    ).toThrow(TenantMismatchError);
  });

  it("injeta o tenant em cada item de uma criação em lote (createMany)", () => {
    const scoped = scopeQueryArgs(
      "Bird",
      "createMany",
      { data: [{ name: "Piu" }, { name: "Lulu" }] },
      TENANT_A,
    );
    expect(scoped.data).toEqual([
      { name: "Piu", tenantId: TENANT_A },
      { name: "Lulu", tenantId: TENANT_A },
    ]);
  });

  it("bloqueia update que tenta mudar o registro para outra tenant", () => {
    expect(() =>
      scopeQueryArgs(
        "Bird",
        "update",
        { where: { id: "1" }, data: { tenantId: TENANT_B } },
        TENANT_A,
      ),
    ).toThrow(TenantMismatchError);
  });

  it("filtra delete/deleteMany pelo tenant do contexto", () => {
    const scoped = scopeQueryArgs(
      "Bird",
      "deleteMany",
      { where: { name: "Piu" } },
      TENANT_A,
    );
    expect(scoped.where).toEqual({ name: "Piu", tenantId: TENANT_A });
  });

  it("filtra upsert pelo tenant do contexto tanto na busca quanto na criação", () => {
    const scoped = scopeQueryArgs(
      "Bird",
      "upsert",
      {
        where: { id: "1" },
        create: { name: "Piu" },
        update: { name: "Piu 2" },
      },
      TENANT_A,
    );
    expect(scoped.where).toEqual({ id: "1", tenantId: TENANT_A });
    expect(scoped.create).toEqual({ name: "Piu", tenantId: TENANT_A });
  });
});
