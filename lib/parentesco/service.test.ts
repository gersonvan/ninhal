import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { runWithTenant } from "@/lib/tenant/context";
import { createAve } from "@/lib/aves/service";
import { calcularCoeficienteParentescoEntreAves } from "./service";
import { alertasConsanguinidadeAtivados } from "@/lib/tenant/preferences";

describe("calcularCoeficienteParentescoEntreAves", () => {
  const suffix = randomUUID();
  let tenant: { id: string };
  let especie: { id: string };

  beforeAll(async () => {
    tenant = await prisma.tenant.create({
      data: { ownerId: `test-owner-parentesco-${suffix}`, name: "Tenant parentesco" },
    });
    especie = await prisma.especie.create({
      data: { nome: `Espécie parentesco ${suffix}` },
    });
  });

  afterAll(async () => {
    await runWithTenant(tenant.id, async () => {
      await prisma.ave.deleteMany({});
    });
    await prisma.tenant.delete({ where: { id: tenant.id } });
    await prisma.especie.delete({ where: { id: especie.id } });
  });

  it("retorna 25% para pai e filha cadastrados no plantel", async () => {
    const pai = await runWithTenant(tenant.id, () =>
      createAve({
        anilha: `BR-PARENTESCO-PAI-${suffix}`,
        especieId: especie.id,
        sexo: "MACHO",
        origem: "ADQUIRIDA",
      }),
    );
    const filha = await runWithTenant(tenant.id, () =>
      createAve({
        anilha: `BR-PARENTESCO-FILHA-${suffix}`,
        especieId: especie.id,
        sexo: "FEMEA",
        origem: "NASCIDA_NO_CRIATORIO",
        anilhaPaiId: pai.id,
      }),
    );

    const coeficiente = await runWithTenant(tenant.id, () =>
      calcularCoeficienteParentescoEntreAves(pai.id, filha.id),
    );
    expect(coeficiente).toBeCloseTo(25);
  });

  it("retorna 0% para aves sem ancestrais em comum", async () => {
    const a = await runWithTenant(tenant.id, () =>
      createAve({
        anilha: `BR-PARENTESCO-A-${suffix}`,
        especieId: especie.id,
        sexo: "MACHO",
        origem: "ADQUIRIDA",
      }),
    );
    const b = await runWithTenant(tenant.id, () =>
      createAve({
        anilha: `BR-PARENTESCO-B-${suffix}`,
        especieId: especie.id,
        sexo: "FEMEA",
        origem: "ADQUIRIDA",
      }),
    );

    const coeficiente = await runWithTenant(tenant.id, () =>
      calcularCoeficienteParentescoEntreAves(a.id, b.id),
    );
    expect(coeficiente).toBe(0);
  });

  it("lê a preferência de alertas de consanguinidade do tenant (default true)", async () => {
    const ativo = await alertasConsanguinidadeAtivados(tenant.id);
    expect(ativo).toBe(true);
  });
});
