import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { normalizarNomeEspecie } from "./normalizar";
import { criarOuReaproveitarEspecie, listarEspecies } from "./service";

/**
 * Testes de integração contra o banco Postgres real (Supabase): o catálogo de
 * Especie é compartilhado globalmente (não isolado por tenant), então a
 * verificação de duplicata precisa ser exercitada contra o banco de verdade.
 */
describe("criarOuReaproveitarEspecie", () => {
  const sufixo = randomUUID();
  const idsCriados: string[] = [];

  afterAll(async () => {
    await prisma.especie.deleteMany({ where: { id: { in: idsCriados } } });
  });

  it("normaliza a capitalização ao criar uma espécie nova", async () => {
    const { especie, criada } = await criarOuReaproveitarEspecie({
      nome: `canário de teste ${sufixo}`,
    });
    idsCriados.push(especie.id);

    expect(criada).toBe(true);
    expect(especie.nome).toBe(normalizarNomeEspecie(`canário de teste ${sufixo}`));
  });

  it("reaproveita uma entrada existente com grafia/caixa diferente em vez de duplicar", async () => {
    const primeira = await criarOuReaproveitarEspecie({
      nome: `calopsita teste ${sufixo}`,
    });
    idsCriados.push(primeira.especie.id);

    const segunda = await criarOuReaproveitarEspecie({
      nome: `CALOPSITA TESTE ${sufixo}`,
    });

    expect(segunda.criada).toBe(false);
    expect(segunda.especie.id).toBe(primeira.especie.id);

    const total = await prisma.especie.count({
      where: { nome: normalizarNomeEspecie(`calopsita teste ${sufixo}`) },
    });
    expect(total).toBe(1);
  });

  it("lança erro de validação para nome vazio", async () => {
    await expect(criarOuReaproveitarEspecie({ nome: "   " })).rejects.toThrow();
  });
});

describe("listarEspecies", () => {
  const sufixo = randomUUID();
  const idsCriados: string[] = [];

  afterAll(async () => {
    await prisma.especie.deleteMany({ where: { id: { in: idsCriados } } });
  });

  it("retorna o catálogo em ordem alfabética", async () => {
    const nomes = [`Zebra Finch ${sufixo}`, `Agapornis ${sufixo}`, `Mandarim ${sufixo}`];
    for (const nome of nomes) {
      const { especie } = await criarOuReaproveitarEspecie({ nome });
      idsCriados.push(especie.id);
    }

    const especies = await listarEspecies();
    const nomesDesteTeste = especies
      .map((especie) => especie.nome)
      .filter((nome) => nome.includes(sufixo));

    expect(nomesDesteTeste).toEqual(
      [...nomesDesteTeste].sort((a, b) => a.localeCompare(b, "pt-BR")),
    );
  });
});
