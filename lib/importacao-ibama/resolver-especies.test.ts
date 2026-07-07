import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { normalizarNomeEspecie } from "@/lib/especies/normalizar";
import type { AveExtraidaIbama } from "./parser";
import { resolverEspeciesDasAves } from "./resolver-especies";

function aveDeTeste(overrides: Partial<AveExtraidaIbama>): AveExtraidaIbama {
  return {
    numero: "1",
    nomeCientifico: "Sicalis flaveola",
    nomeComum: "Canário-da-terra",
    sexo: "MACHO",
    dataNascimento: null,
    tipoAnilha: "Fechada",
    diametroAnilha: "2,5",
    anilha: "BR12345678",
    ...overrides,
  };
}

describe("resolverEspeciesDasAves", () => {
  const sufixo = randomUUID();
  const idsCriados: string[] = [];

  afterAll(async () => {
    await prisma.especie.deleteMany({ where: { id: { in: idsCriados } } });
  });

  it("cria a espécie ausente do catálogo com a normalização correta", async () => {
    const nomeComum = `curió de teste ${sufixo}`;
    const [ave] = await resolverEspeciesDasAves([aveDeTeste({ nomeComum })]);
    idsCriados.push(ave.especieId);

    const especie = await prisma.especie.findUnique({ where: { id: ave.especieId } });
    expect(especie).not.toBeNull();
    expect(especie!.nome).toBe(normalizarNomeEspecie(nomeComum));
  });

  it("reaproveita uma espécie já existente, mesmo com grafia/caixa diferente", async () => {
    const nomeOriginal = `bicudo verdadeiro teste ${sufixo}`;
    const existente = await prisma.especie.create({
      data: { nome: `Bicudo Verdadeiro Teste ${sufixo}` },
    });
    idsCriados.push(existente.id);

    const [ave] = await resolverEspeciesDasAves([
      aveDeTeste({ nomeComum: nomeOriginal.toUpperCase() }),
    ]);

    expect(ave.especieId).toBe(existente.id);

    const total = await prisma.especie.count({
      where: { nome: `Bicudo Verdadeiro Teste ${sufixo}` },
    });
    expect(total).toBe(1);
  });

  it("resolve nomes comuns repetidos no mesmo lote uma única vez", async () => {
    const nomeComum = `galo-da-campina teste ${sufixo}`;
    const aves = await resolverEspeciesDasAves([
      aveDeTeste({ numero: "1", nomeComum, anilha: "BR11111111" }),
      aveDeTeste({ numero: "2", nomeComum, anilha: "BR22222222" }),
    ]);
    idsCriados.push(aves[0].especieId);

    expect(aves[0].especieId).toBe(aves[1].especieId);

    const total = await prisma.especie.count({
      where: { nome: normalizarNomeEspecie(nomeComum) },
    });
    expect(total).toBe(1);
  });

  it("anexa o especieId preservando os demais campos extraídos", async () => {
    const nomeComum = `pintassilgo teste ${sufixo}`;
    const [ave] = await resolverEspeciesDasAves([
      aveDeTeste({ nomeComum, anilha: "BR99999999" }),
    ]);
    idsCriados.push(ave.especieId);

    expect(ave.anilha).toBe("BR99999999");
    expect(ave.nomeCientifico).toBe("Sicalis flaveola");
    expect(ave.especieId).toBeTruthy();
  });
});
