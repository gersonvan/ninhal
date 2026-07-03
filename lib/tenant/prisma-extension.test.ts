import { afterEach, describe, expect, it } from "vitest";
import { runWithTenant } from "./context";
import { tenantScopingExtension } from "./prisma-extension";
import { TENANT_SCOPED_MODELS } from "./scoped-models";

type AllOperationsHook = (params: {
  model: string;
  operation: string;
  args: unknown;
  query: (args: unknown) => Promise<unknown>;
}) => unknown;

/**
 * Cliente Prisma "fake" mínimo, o suficiente para capturar o hook $allOperations
 * registrado pela extensão e simular o Prisma Client invocando-o, sem precisar de
 * conexão de rede com um banco real.
 */
function createFakeClient() {
  return {
    $extends(config: {
      query: { $allModels: { $allOperations: AllOperationsHook } };
    }) {
      return {
        async run(model: string, operation: string, args: unknown) {
          let capturedArgs: unknown;
          await config.query.$allModels.$allOperations({
            model,
            operation,
            args,
            query: async (finalArgs: unknown) => {
              capturedArgs = finalArgs;
              return finalArgs;
            },
          });
          return capturedArgs;
        },
      };
    },
  };
}

describe("tenantScopingExtension", () => {
  afterEach(() => {
    TENANT_SCOPED_MODELS.delete("FakeBird");
  });

  it("não altera argumentos de modelos que não estão na lista tenant-scoped (ex: Tenant)", async () => {
    const extended = tenantScopingExtension(createFakeClient() as never) as unknown as {
      run: (model: string, operation: string, args: unknown) => Promise<unknown>;
    };

    const result = await runWithTenant("tenant-a", () =>
      extended.run("Tenant", "findMany", { where: { name: "Sítio" } }),
    );

    expect(result).toEqual({ where: { name: "Sítio" } });
  });

  it("filtra pelo tenant do contexto atual uma consulta à mesma tenant", async () => {
    TENANT_SCOPED_MODELS.add("FakeBird");
    const extended = tenantScopingExtension(createFakeClient() as never) as unknown as {
      run: (model: string, operation: string, args: unknown) => Promise<unknown>;
    };

    const result = await runWithTenant("tenant-a", () =>
      extended.run("FakeBird", "findMany", { where: { name: "Piu" } }),
    );

    expect(result).toEqual({ where: { name: "Piu", tenantId: "tenant-a" } });
  });

  it("bloqueia o acesso a dados de uma tenant diferente da do contexto atual", async () => {
    TENANT_SCOPED_MODELS.add("FakeBird");
    const extended = tenantScopingExtension(createFakeClient() as never) as unknown as {
      run: (model: string, operation: string, args: unknown) => Promise<unknown>;
    };

    await expect(
      runWithTenant("tenant-a", () =>
        extended.run("FakeBird", "findMany", {
          where: { tenantId: "tenant-b" },
        }),
      ),
    ).rejects.toThrow("tentou acessar ou gravar dados de um tenant diferente");
  });

  it("bloqueia o acesso a modelo tenant-scoped fora de um contexto de tenant", async () => {
    TENANT_SCOPED_MODELS.add("FakeBird");
    const extended = tenantScopingExtension(createFakeClient() as never) as unknown as {
      run: (model: string, operation: string, args: unknown) => Promise<unknown>;
    };

    await expect(extended.run("FakeBird", "findMany", {})).rejects.toThrow(
      "exige um tenant no contexto de execução",
    );
  });
});
