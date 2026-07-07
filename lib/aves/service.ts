import { Prisma, type SexoAve, type StatusAve } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { assertMaeCompativel, assertPaiCompativel } from "./compatibility";
import { AnilhaDuplicadaError, RegistroNaoEncontradoError } from "./errors";
import {
  createAveSchema,
  updateAveSchema,
  type CreateAveInput,
  type UpdateAveInput,
} from "./schema";

async function validarParentes(input: {
  especieId: string;
  anilhaPaiId?: string;
  anilhaMaeId?: string;
}) {
  if (input.anilhaPaiId) {
    const pai = await prisma.ave.findUnique({
      where: { id: input.anilhaPaiId },
    });
    if (!pai) throw new RegistroNaoEncontradoError("Ave (pai)");
    assertPaiCompativel(pai, input.especieId);
  }
  if (input.anilhaMaeId) {
    const mae = await prisma.ave.findUnique({
      where: { id: input.anilhaMaeId },
    });
    if (!mae) throw new RegistroNaoEncontradoError("Ave (mãe)");
    assertMaeCompativel(mae, input.especieId);
  }
}

function isAnilhaDuplicada(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export async function createAve(input: unknown) {
  const data: CreateAveInput = createAveSchema.parse(input);
  await validarParentes(data);

  try {
    // O middleware de isolamento (lib/tenant/prisma-extension.ts) injeta `tenantId`
    // a partir do contexto de execução antes da consulta chegar ao banco.
    return await prisma.ave.create({
      data: data as unknown as Prisma.AveUncheckedCreateInput,
    });
  } catch (error) {
    if (isAnilhaDuplicada(error)) throw new AnilhaDuplicadaError();
    throw error;
  }
}

export interface ListAvesFiltros {
  /** Busca por nome/apelido ou anilha (case-insensitive, substring). */
  busca?: string;
  especieId?: string;
  sexo?: SexoAve;
  status?: StatusAve;
}

export async function listAves(filtros: ListAvesFiltros = {}) {
  const where: Prisma.AveWhereInput = {};

  if (filtros.busca) {
    where.OR = [
      { nomeApelido: { contains: filtros.busca, mode: "insensitive" } },
      { anilha: { contains: filtros.busca, mode: "insensitive" } },
    ];
  }
  if (filtros.especieId) where.especieId = filtros.especieId;
  if (filtros.sexo) where.sexo = filtros.sexo;
  if (filtros.status) where.status = filtros.status;

  // `await` explícito é necessário mesmo podendo retornar a promise diretamente:
  // sem ele, o Prisma só despacha a consulta (e aciona o middleware de tenant) no
  // `.then()` do chamador, que corre fora do contexto síncrono de `runWithTenant`.
  return await prisma.ave.findMany({
    where,
    include: { especie: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAve(id: string) {
  return await prisma.ave.findUnique({
    where: { id },
    include: { especie: true, paiAve: true, maeAve: true },
  });
}

/** Usado pela importação do IBAMA (Task 2.4) para detectar anilha já cadastrada no tenant atual. */
export async function buscarAvePorAnilha(anilha: string) {
  return await prisma.ave.findFirst({ where: { anilha } });
}

export async function updateAve(id: string, input: unknown) {
  const data: UpdateAveInput = updateAveSchema.parse(input);

  const atual = await prisma.ave.findUnique({ where: { id } });
  if (!atual) throw new RegistroNaoEncontradoError("Ave");

  const especieId = data.especieId ?? atual.especieId;
  await validarParentes({
    especieId,
    anilhaPaiId: data.anilhaPaiId,
    anilhaMaeId: data.anilhaMaeId,
  });

  try {
    return await prisma.ave.update({ where: { id }, data });
  } catch (error) {
    if (isAnilhaDuplicada(error)) throw new AnilhaDuplicadaError();
    throw error;
  }
}
