import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  assertAveAtivaParaReproducao,
  assertMaeCompativel,
  assertPaiCompativel,
} from "@/lib/aves/compatibility";
import { RegistroNaoEncontradoError } from "@/lib/aves/errors";
import { calcularCoeficienteParentescoEntreAves } from "@/lib/parentesco/service";
import { calcularTaxaEclosao } from "./calculos";
import { gerarProximoCodNinhada } from "./codigo";
import { CodNinhadaDuplicadoError } from "./errors";
import {
  createNinhadaSchema,
  updateNinhadaSchema,
  type CreateNinhadaInput,
  type UpdateNinhadaInput,
} from "./schema";

const INCLUDE_CASAL = {
  macho: { include: { especie: true } },
  femea: { include: { especie: true } },
} satisfies Prisma.NinhadaInclude;

async function validarCasal(anilhaMachoId: string, anilhaFemeaId: string) {
  const macho = await prisma.ave.findUnique({ where: { id: anilhaMachoId } });
  if (!macho) throw new RegistroNaoEncontradoError("Ave (macho)");

  const femea = await prisma.ave.findUnique({ where: { id: anilhaFemeaId } });
  if (!femea) throw new RegistroNaoEncontradoError("Ave (fêmea)");

  assertPaiCompativel(macho, femea.especieId);
  assertAveAtivaParaReproducao(macho);
  assertMaeCompativel(femea, macho.especieId);
  assertAveAtivaParaReproducao(femea);
}

function isCodDuplicado(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function comTaxaEclosao<T extends { ovosBotados: number | null; filhotesNascidos: number | null }>(
  ninhada: T,
) {
  return {
    ...ninhada,
    taxaEclosao: calcularTaxaEclosao(ninhada.ovosBotados, ninhada.filhotesNascidos),
  };
}

const MAX_TENTATIVAS_CODIGO = 5;

export async function createNinhada(input: unknown) {
  const data: CreateNinhadaInput = createNinhadaSchema.parse(input);
  await validarCasal(data.anilhaMachoId, data.anilhaFemeaId);

  if (data.codNinhada) {
    try {
      const ninhada = await prisma.ninhada.create({
        data: data as unknown as Prisma.NinhadaUncheckedCreateInput,
        include: INCLUDE_CASAL,
      });
      return comTaxaEclosao(ninhada);
    } catch (error) {
      if (isCodDuplicado(error)) throw new CodNinhadaDuplicadoError();
      throw error;
    }
  }

  const ano = data.dataPostura.getUTCFullYear();
  for (let tentativa = 0; tentativa < MAX_TENTATIVAS_CODIGO; tentativa++) {
    const codNinhada = await gerarProximoCodNinhada(ano);
    try {
      const ninhada = await prisma.ninhada.create({
        data: {
          ...data,
          codNinhada,
        } as unknown as Prisma.NinhadaUncheckedCreateInput,
        include: INCLUDE_CASAL,
      });
      return comTaxaEclosao(ninhada);
    } catch (error) {
      const ultimaTentativa = tentativa === MAX_TENTATIVAS_CODIGO - 1;
      if (isCodDuplicado(error) && !ultimaTentativa) continue;
      if (isCodDuplicado(error)) throw new CodNinhadaDuplicadoError();
      throw error;
    }
  }

  throw new CodNinhadaDuplicadoError();
}

export async function listNinhadas() {
  const ninhadas = await prisma.ninhada.findMany({
    include: INCLUDE_CASAL,
    orderBy: { createdAt: "desc" },
  });

  const comParentesco = await Promise.all(
    ninhadas.map(async (ninhada) => ({
      ...comTaxaEclosao(ninhada),
      coeficienteParentesco: await calcularCoeficienteParentescoEntreAves(
        ninhada.anilhaMachoId,
        ninhada.anilhaFemeaId,
      ),
    })),
  );

  return comParentesco;
}

export async function getNinhada(id: string) {
  const ninhada = await prisma.ninhada.findUnique({
    where: { id },
    include: INCLUDE_CASAL,
  });
  if (!ninhada) return null;

  const coeficienteParentesco = await calcularCoeficienteParentescoEntreAves(
    ninhada.anilhaMachoId,
    ninhada.anilhaFemeaId,
  );

  return { ...comTaxaEclosao(ninhada), coeficienteParentesco };
}

/** Aves geradas por este casal (filhas cadastradas com este macho como pai e esta fêmea como mãe). */
export async function listFilhotesGerados(
  anilhaMachoId: string,
  anilhaFemeaId: string,
) {
  return await prisma.ave.findMany({
    where: { anilhaPaiId: anilhaMachoId, anilhaMaeId: anilhaFemeaId },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Determina quais das aves informadas (por ID) estão referenciadas como macho ou
 * fêmea em uma Ninhada em andamento (`filhotesNascidos` nulo — ver Task 3.1/3.5
 * para a definição operacional). Indicador puramente de exibição: não lê nem
 * altera o campo `status` armazenado da ave.
 */
export async function listAveIdsEmNinhadaAndamento(
  aveIds: string[],
): Promise<Set<string>> {
  if (aveIds.length === 0) return new Set();

  const ninhadasEmAndamento = await prisma.ninhada.findMany({
    where: {
      filhotesNascidos: null,
      OR: [
        { anilhaMachoId: { in: aveIds } },
        { anilhaFemeaId: { in: aveIds } },
      ],
    },
    select: { anilhaMachoId: true, anilhaFemeaId: true },
  });

  const idsConsultados = new Set(aveIds);
  const emAndamento = new Set<string>();
  for (const ninhada of ninhadasEmAndamento) {
    if (idsConsultados.has(ninhada.anilhaMachoId)) {
      emAndamento.add(ninhada.anilhaMachoId);
    }
    if (idsConsultados.has(ninhada.anilhaFemeaId)) {
      emAndamento.add(ninhada.anilhaFemeaId);
    }
  }
  return emAndamento;
}

/** Variante para uma única ave — ver listAveIdsEmNinhadaAndamento. */
export async function aveEstaEmNinhadaAndamento(aveId: string): Promise<boolean> {
  const resultado = await listAveIdsEmNinhadaAndamento([aveId]);
  return resultado.has(aveId);
}

/**
 * A Ninhada em andamento (filhotesNascidos nulo) mais recente que referencia a ave
 * informada como macho ou fêmea, com o coeficiente de parentesco do casal já
 * calculado — usada pelo banner de ninhada ativa na Árvore Genealógica (Task 4.2).
 * Retorna null se a ave não estiver em nenhuma ninhada em andamento.
 */
export async function buscarNinhadaAtivaDaAve(aveId: string) {
  const ninhada = await prisma.ninhada.findFirst({
    where: {
      filhotesNascidos: null,
      OR: [{ anilhaMachoId: aveId }, { anilhaFemeaId: aveId }],
    },
    include: INCLUDE_CASAL,
    orderBy: { createdAt: "desc" },
  });
  if (!ninhada) return null;

  const coeficienteParentesco = await calcularCoeficienteParentescoEntreAves(
    ninhada.anilhaMachoId,
    ninhada.anilhaFemeaId,
  );

  return { ...comTaxaEclosao(ninhada), coeficienteParentesco };
}

export async function updateNinhada(id: string, input: unknown) {
  const data: UpdateNinhadaInput = updateNinhadaSchema.parse(input);

  const atual = await prisma.ninhada.findUnique({ where: { id } });
  if (!atual) throw new RegistroNaoEncontradoError("Ninhada");

  if (data.anilhaMachoId || data.anilhaFemeaId) {
    await validarCasal(
      data.anilhaMachoId ?? atual.anilhaMachoId,
      data.anilhaFemeaId ?? atual.anilhaFemeaId,
    );
  }

  try {
    const ninhada = await prisma.ninhada.update({
      where: { id },
      data,
      include: INCLUDE_CASAL,
    });
    return comTaxaEclosao(ninhada);
  } catch (error) {
    if (isCodDuplicado(error)) throw new CodNinhadaDuplicadoError();
    throw error;
  }
}

/**
 * Exclui uma ninhada, destinada a corrigir registros errados. Os filhotes já
 * cadastrados a partir dela não são afetados: a genealogia vive nos campos
 * pai/mãe das próprias aves, sem chave estrangeira para a ninhada.
 */
export async function deleteNinhada(id: string) {
  const ninhada = await prisma.ninhada.findUnique({ where: { id } });
  if (!ninhada) throw new RegistroNaoEncontradoError("Ninhada");

  await prisma.ninhada.delete({ where: { id } });
}
