import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { runWithTenant } from "@/lib/tenant/context";
import { createAve } from "@/lib/aves/service";
import { agruparEmPaginas, montarDadosCrachaLote, montarDadosPedigree } from "./service";
import { RegistroNaoEncontradoError } from "@/lib/aves/errors";
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

describe("montarDadosCrachaLote (integração)", () => {
  const suffix = randomUUID();
  let tenant: { id: string };
  let outroTenant: { id: string };
  let especie: { id: string };

  beforeAll(async () => {
    tenant = await prisma.tenant.create({
      data: { ownerId: `test-owner-lote-${suffix}`, name: "Aviário de Teste" },
    });
    outroTenant = await prisma.tenant.create({
      data: { ownerId: `test-owner-lote-outro-${suffix}`, name: "Outro Aviário" },
    });
    especie = await prisma.especie.create({
      data: { nome: `Espécie lote ${suffix}` },
    });
  });

  afterAll(async () => {
    await runWithTenant(tenant.id, async () => {
      await prisma.ave.deleteMany({});
    });
    await runWithTenant(outroTenant.id, async () => {
      await prisma.ave.deleteMany({});
    });
    await prisma.tenant.delete({ where: { id: tenant.id } });
    await prisma.tenant.delete({ where: { id: outroTenant.id } });
    await prisma.especie.delete({ where: { id: especie.id } });
  });

  it("monta os dados de várias aves em uma única chamada, na ordem dos ids pedidos", async () => {
    const primeira = await runWithTenant(tenant.id, () =>
      createAve({
        anilha: `BR-LOTE-A-${suffix}`,
        nomeApelido: "Primeira",
        especieId: especie.id,
        sexo: "MACHO",
        origem: "ADQUIRIDA",
      }),
    );
    const segunda = await runWithTenant(tenant.id, () =>
      createAve({
        anilha: `BR-LOTE-B-${suffix}`,
        nomeApelido: "Segunda",
        especieId: especie.id,
        sexo: "FEMEA",
        origem: "ADQUIRIDA",
      }),
    );

    const lote = await runWithTenant(tenant.id, () =>
      // Pede na ordem [segunda, primeira] — o resultado deve respeitar essa ordem.
      montarDadosCrachaLote(
        [segunda.id, primeira.id],
        tenant.id,
        "Responsável de Teste",
      ),
    );

    expect(lote.map((d) => d.ave.nomeApelido)).toEqual(["Segunda", "Primeira"]);
  });

  it("ignora ids de aves de outro tenant, sem vazar dados entre contas", async () => {
    const minhaAve = await runWithTenant(tenant.id, () =>
      createAve({
        anilha: `BR-LOTE-MINHA-${suffix}`,
        especieId: especie.id,
        sexo: "MACHO",
        origem: "ADQUIRIDA",
      }),
    );
    const aveDoOutro = await runWithTenant(outroTenant.id, () =>
      createAve({
        anilha: `BR-LOTE-OUTRO-${suffix}`,
        especieId: especie.id,
        sexo: "MACHO",
        origem: "ADQUIRIDA",
      }),
    );

    const lote = await runWithTenant(tenant.id, () =>
      montarDadosCrachaLote(
        [minhaAve.id, aveDoOutro.id],
        tenant.id,
        "Responsável de Teste",
      ),
    );

    expect(lote).toHaveLength(1);
    expect(lote[0].ave.anilha).toBe(minhaAve.anilha);
  });

  it("lança RegistroNaoEncontradoError quando nenhuma das aves pedidas existe no tenant", async () => {
    await expect(
      runWithTenant(tenant.id, () =>
        montarDadosCrachaLote(["id-inexistente"], tenant.id, "Responsável"),
      ),
    ).rejects.toBeInstanceOf(RegistroNaoEncontradoError);
  });
});

describe("agruparEmPaginas", () => {
  it("divide a lista em grupos completos do tamanho pedido", () => {
    expect(agruparEmPaginas([1, 2, 3, 4, 5, 6], 2)).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
  });

  it("deixa o último grupo incompleto quando a lista não é múltipla do tamanho da página", () => {
    expect(agruparEmPaginas([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("retorna lista vazia quando não há itens", () => {
    expect(agruparEmPaginas([], 8)).toEqual([]);
  });
});
