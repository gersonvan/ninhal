import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { runWithTenant } from "@/lib/tenant/context";
import { executarImportacao } from "./importar";
import type { LinhaConfirmacaoIbama } from "./types";

describe("executarImportacao", () => {
  const suffix = randomUUID();
  let tenant: { id: string };
  let especie: { id: string };

  beforeAll(async () => {
    tenant = await prisma.tenant.create({
      data: { ownerId: `test-owner-importar-${suffix}`, name: "Tenant de teste" },
    });
    especie = await prisma.especie.create({
      data: { nome: `Espécie importar ${suffix}` },
    });
  });

  afterAll(async () => {
    await runWithTenant(tenant.id, () => prisma.ave.deleteMany({}));
    await prisma.tenant.delete({ where: { id: tenant.id } });
    await prisma.especie.delete({ where: { id: especie.id } });
  });

  function linhaDeTeste(overrides: Partial<LinhaConfirmacaoIbama>): LinhaConfirmacaoIbama {
    return {
      linhaId: randomUUID(),
      nomeApelido: "",
      nomeCientifico: "Sicalis flaveola",
      anilha: `BR-IMPORT-${randomUUID()}`,
      especieId: especie.id,
      sexo: "MACHO",
      dataNascimento: "",
      tipoAnilha: "Fechada",
      diametroAnilha: "2,5",
      registro: "",
      origem: "ADQUIRIDA",
      anilhaPaiId: "",
      anilhaMaeId: "",
      duplicada: false,
      aveExistenteId: null,
      atualizarExistente: false,
      ...overrides,
    };
  }

  it("cria uma ave nova para uma linha não duplicada, persistindo os valores editados", async () => {
    const linha = linhaDeTeste({
      nomeApelido: "Nome Editado Pelo Usuário",
      anilha: `BR-IMPORT-CRIAR-${suffix}`,
    });

    const resultado = await runWithTenant(tenant.id, () => executarImportacao([linha]));

    expect(resultado).toEqual({ criadas: 1, atualizadas: 0, ignoradas: 0 });

    const criada = await runWithTenant(tenant.id, () =>
      prisma.ave.findFirst({ where: { anilha: linha.anilha } }),
    );
    expect(criada?.nomeApelido).toBe("Nome Editado Pelo Usuário");
  });

  it("ignora uma linha duplicada quando o usuário não confirma atualizar", async () => {
    const anilha = `BR-IMPORT-DUP-${suffix}`;
    const existente = await runWithTenant(tenant.id, () =>
      prisma.ave.create({
        data: {
          tenantId: tenant.id,
          anilha,
          especieId: especie.id,
          sexo: "MACHO",
          origem: "ADQUIRIDA",
        },
      }),
    );

    const linha = linhaDeTeste({
      anilha,
      nomeApelido: "Não deveria ser salvo",
      duplicada: true,
      aveExistenteId: existente.id,
      atualizarExistente: false,
    });

    const resultado = await runWithTenant(tenant.id, () => executarImportacao([linha]));

    expect(resultado).toEqual({ criadas: 0, atualizadas: 0, ignoradas: 1 });

    const semAlteracao = await runWithTenant(tenant.id, () =>
      prisma.ave.findUnique({ where: { id: existente.id } }),
    );
    expect(semAlteracao?.nomeApelido).toBeNull();
  });

  it("atualiza o registro existente quando o usuário confirma explicitamente", async () => {
    const anilha = `BR-IMPORT-UPD-${suffix}`;
    const existente = await runWithTenant(tenant.id, () =>
      prisma.ave.create({
        data: {
          tenantId: tenant.id,
          anilha,
          especieId: especie.id,
          sexo: "MACHO",
          origem: "ADQUIRIDA",
        },
      }),
    );

    const linha = linhaDeTeste({
      anilha,
      nomeApelido: "Atualizado via importação",
      duplicada: true,
      aveExistenteId: existente.id,
      atualizarExistente: true,
    });

    const resultado = await runWithTenant(tenant.id, () => executarImportacao([linha]));

    expect(resultado).toEqual({ criadas: 0, atualizadas: 1, ignoradas: 0 });

    const atualizada = await runWithTenant(tenant.id, () =>
      prisma.ave.findUnique({ where: { id: existente.id } }),
    );
    expect(atualizada?.nomeApelido).toBe("Atualizado via importação");
  });

  it("persiste os campos exclusivos da importação (nomeCientifico, tipoAnilha, diametroAnilha, registro)", async () => {
    const linha = linhaDeTeste({
      anilha: `BR-IMPORT-CAMPOS-${suffix}`,
      nomeCientifico: "Paroaria dominicana",
      tipoAnilha: "Aberta",
      diametroAnilha: "3,0",
      registro: "IBAMA-999/2024",
    });

    await runWithTenant(tenant.id, () => executarImportacao([linha]));

    const criada = await runWithTenant(tenant.id, () =>
      prisma.ave.findFirst({ where: { anilha: linha.anilha } }),
    );
    expect(criada?.nomeCientifico).toBe("Paroaria dominicana");
    expect(criada?.tipoAnilha).toBe("Aberta");
    expect(criada?.diametroAnilha).toBe("3,0");
    expect(criada?.registro).toBe("IBAMA-999/2024");
  });
});
