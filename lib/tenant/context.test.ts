import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { runWithTenant } from "./context";

/**
 * Reproduz deliberadamente o padrão de callback que historicamente perdia o contexto
 * de tenant (Task 2.1, Task 3.5): uma arrow function comum (sem quebra de função
 * async) que apenas retorna a promise lazy do Prisma, sem `await` interno nenhum.
 *
 * A salvaguarda estrutural (runWithTenant aguardando `fn()` internamente — ver
 * lib/tenant/context.ts) deve tornar esse padrão seguro por construção, mesmo que o
 * chamador o escreva incorretamente. Este teste comprova isso contra o banco real,
 * não apenas com um mock — se a salvaguarda regredir, esta consulta volta a lançar
 * `MissingTenantContextError`.
 */
describe("runWithTenant — salvaguarda contra callback sem await interno", () => {
  const suffix = randomUUID();
  let tenant: { id: string };
  let outroTenant: { id: string };
  let especie: { id: string };

  beforeAll(async () => {
    tenant = await prisma.tenant.create({
      data: { ownerId: `test-owner-ctx-${suffix}`, name: "Tenant contexto" },
    });
    outroTenant = await prisma.tenant.create({
      data: { ownerId: `test-owner-ctx-outro-${suffix}`, name: "Outro tenant" },
    });
    especie = await prisma.especie.create({
      data: { nome: `Espécie contexto ${suffix}` },
    });

    // Ave de outro tenant, usada para confirmar que o isolamento (não só a ausência
    // de erro) continua correto com o padrão de callback "incorreto".
    await runWithTenant(outroTenant.id, async () => {
      await prisma.ave.create({
        data: {
          anilha: `BR-CTX-OUTRO-${suffix}`,
          especieId: especie.id,
          sexo: "MACHO",
          origem: "ADQUIRIDA",
        } as unknown as Prisma.AveUncheckedCreateInput,
      });
    });
  });

  afterAll(async () => {
    await runWithTenant(tenant.id, async () => {
      await prisma.ave.deleteMany({});
    });
    await runWithTenant(outroTenant.id, async () => {
      await prisma.ave.deleteMany({});
    });
    await prisma.tenant.deleteMany({
      where: { id: { in: [tenant.id, outroTenant.id] } },
    });
    await prisma.especie.delete({ where: { id: especie.id } });
  });

  it("não lança MissingTenantContextError mesmo com um callback não-async que só retorna a promise do Prisma", async () => {
    // Callback deliberadamente "incorreto": arrow function comum, sem `async`, sem
    // `await` interno — exatamente o padrão que já causou falha duas vezes.
    await expect(
      runWithTenant(tenant.id, () =>
        prisma.ave.create({
          data: {
            anilha: `BR-CTX-CRIA-${suffix}`,
            especieId: especie.id,
            sexo: "FEMEA",
            origem: "ADQUIRIDA",
          } as unknown as Prisma.AveUncheckedCreateInput,
        }),
      ),
    ).resolves.toBeDefined();
  });

  it("aplica o isolamento por tenant corretamente com esse mesmo padrão de callback", async () => {
    const resultado = await runWithTenant(tenant.id, () => prisma.ave.findMany({}));

    expect(resultado.length).toBeGreaterThan(0);
    expect(resultado.every((ave) => ave.tenantId === tenant.id)).toBe(true);
    expect(resultado.some((ave) => ave.anilha === `BR-CTX-OUTRO-${suffix}`)).toBe(
      false,
    );
  });

  it("continua funcionando normalmente para o padrão já recomendado (callback async com await interno)", async () => {
    const resultado = await runWithTenant(tenant.id, async () => {
      return await prisma.ave.findMany({});
    });

    expect(resultado.every((ave) => ave.tenantId === tenant.id)).toBe(true);
  });
});
