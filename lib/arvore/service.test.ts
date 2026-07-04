import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { runWithTenant } from "@/lib/tenant/context";
import { createAve } from "@/lib/aves/service";
import { montarArvoreGenealogica } from "./service";

describe("montarArvoreGenealogica (integração)", () => {
  const suffix = randomUUID();
  let tenant: { id: string };
  let especie: { id: string };

  beforeAll(async () => {
    tenant = await prisma.tenant.create({
      data: { ownerId: `test-owner-arvore-${suffix}`, name: "Tenant árvore" },
    });
    especie = await prisma.especie.create({
      data: { nome: `Espécie árvore ${suffix}` },
    });
  });

  afterAll(async () => {
    await runWithTenant(tenant.id, async () => {
      await prisma.ave.deleteMany({});
    });
    await prisma.tenant.delete({ where: { id: tenant.id } });
    await prisma.especie.delete({ where: { id: especie.id } });
  });

  it("monta a árvore buscando pais e avós reais do banco", async () => {
    const avo = await runWithTenant(tenant.id, () =>
      createAve({
        anilha: `BR-ARVORE-AVO-${suffix}`,
        especieId: especie.id,
        sexo: "MACHO",
        origem: "ADQUIRIDA",
      }),
    );
    const pai = await runWithTenant(tenant.id, () =>
      createAve({
        anilha: `BR-ARVORE-PAI-${suffix}`,
        especieId: especie.id,
        sexo: "MACHO",
        origem: "NASCIDA_NO_CRIATORIO",
        anilhaPaiId: avo.id,
      }),
    );
    const principal = await runWithTenant(tenant.id, () =>
      createAve({
        anilha: `BR-ARVORE-PRINCIPAL-${suffix}`,
        especieId: especie.id,
        sexo: "FEMEA",
        origem: "NASCIDA_NO_CRIATORIO",
        anilhaPaiId: pai.id,
      }),
    );

    const arvore = await runWithTenant(tenant.id, () =>
      montarArvoreGenealogica(principal.id),
    );

    expect(arvore.ave.id).toBe(principal.id);
    expect(arvore.pai).toMatchObject({ conhecido: true, id: pai.id });
    expect(arvore.paiDoPai).toMatchObject({ conhecido: true, id: avo.id });
    expect(arvore.mae).toEqual({
      conhecido: false,
      motivo: "NAO_REGISTRADO",
      label: "Não registrada",
    });
    // O avô paterno (avo) foi Adquirido, então os pais dele (bisavós paternos,
    // fora do escopo de 3 gerações a partir de "principal") não são calculados
    // aqui — mas os PAIS do "pai" (que é o avô materno... ou seja, os avós
    // paternos de "principal") já contemplam o avô "avo" em si, corretamente
    // conhecido nesta árvore de 3 gerações.
    expect(arvore.maeDoPai).toEqual({
      conhecido: false,
      motivo: "NAO_REGISTRADO",
      label: "Não registrada",
    });
  });
});
