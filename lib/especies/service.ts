import type { Especie } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizarNomeEspecie } from "./normalizar";
import { createEspecieSchema } from "./schema";

export interface ResultadoCriarEspecie {
  especie: Especie;
  criada: boolean;
}

/**
 * Cria uma espécie no catálogo compartilhado, normalizando o nome e
 * reaproveitando uma entrada existente equivalente (mesmo com grafia/caixa
 * diferente) em vez de criar uma duplicata. Reutilizável por qualquer fluxo
 * que precise garantir uma espécie no catálogo (cadastro manual, importação
 * em lote da Stage 2).
 */
export async function criarOuReaproveitarEspecie(
  input: unknown,
): Promise<ResultadoCriarEspecie> {
  const { nome } = createEspecieSchema.parse(input);
  const nomeNormalizado = normalizarNomeEspecie(nome);

  const existentes = await prisma.especie.findMany();
  const existente = existentes.find(
    (especie) => especie.nome.toLowerCase() === nomeNormalizado.toLowerCase(),
  );
  if (existente) {
    return { especie: existente, criada: false };
  }

  const especie = await prisma.especie.create({ data: { nome: nomeNormalizado } });
  return { especie, criada: true };
}

/** Lista o catálogo de espécies em ordem alfabética. */
export async function listarEspecies(): Promise<Especie[]> {
  return prisma.especie.findMany({ orderBy: { nome: "asc" } });
}
