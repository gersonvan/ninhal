import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { runWithTenant } from "@/lib/tenant/context";
import { createAve } from "@/lib/aves/service";
import { montarDadosPedigree } from "./service";
import PedigreeDocument from "./PedigreeDocument";

describe("montarDadosPedigree (integração)", () => {
  const suffix = randomUUID();
  let tenant: { id: string };
  let especie: { id: string };

  beforeAll(async () => {
    tenant = await prisma.tenant.create({
      data: {
        ownerId: `test-owner-pedigree-${suffix}`,
        name: "Aviário de Teste",
      },
    });
    especie = await prisma.especie.create({
      data: { nome: `Espécie pedigree ${suffix}` },
    });
  });

  afterAll(async () => {
    await runWithTenant(tenant.id, async () => {
      await prisma.ave.deleteMany({});
    });
    await prisma.tenant.delete({ where: { id: tenant.id } });
    await prisma.especie.delete({ where: { id: especie.id } });
  });

  it("monta os dados e gera um PDF real (buffer não vazio) sem lançar erros", async () => {
    const pai = await runWithTenant(tenant.id, () =>
      createAve({
        anilha: `BR-PDF-PAI-${suffix}`,
        especieId: especie.id,
        sexo: "MACHO",
        origem: "ADQUIRIDA",
      }),
    );
    const principal = await runWithTenant(tenant.id, () =>
      createAve({
        anilha: `BR-PDF-PRINCIPAL-${suffix}`,
        nomeApelido: "Ave de Teste",
        especieId: especie.id,
        sexo: "FEMEA",
        origem: "NASCIDA_NO_CRIATORIO",
        anilhaPaiId: pai.id,
      }),
    );

    const dados = await runWithTenant(tenant.id, () =>
      montarDadosPedigree(principal.id, tenant.id, "Responsável de Teste"),
    );

    expect(dados.ave.nomeApelido).toBe("Ave de Teste");
    expect(dados.codigoVerificacao).toMatch(/^PDG-\d{4}-[A-Z]{1,2}$/);

    const buffer = await renderToBuffer(PedigreeDocument({ dados }));
    expect(buffer.length).toBeGreaterThan(1000);
    // Assinatura de arquivo PDF ("%PDF").
    expect(buffer.subarray(0, 4).toString("ascii")).toBe("%PDF");
  });
});
