import { getAve } from "@/lib/aves/service";
import { RegistroNaoEncontradoError } from "@/lib/aves/errors";
import {
  ORIGEM_AVE_LABELS,
  SEXO_AVE_LABELS,
} from "@/lib/aves/labels";
import { montarArvoreGenealogica } from "@/lib/arvore/service";
import type { ArvoreGenealogica } from "@/lib/arvore/construir";
import { prisma } from "@/lib/prisma";
import { gerarCodigoVerificacao } from "./verificacao";

export interface DadosPedigreeAve {
  nomeApelido: string | null;
  anilha: string;
  especieNome: string;
  mutacaoCor: string | null;
  sexoLabel: string;
  dataNascimentoLabel: string;
  origemLabel: string;
  fotoUrl: string | null;
  registro: string | null;
}

export interface DadosPedigree {
  ave: DadosPedigreeAve;
  arvore: ArvoreGenealogica;
  criatorioNome: string;
  criatorioLogoUrl: string | null;
  responsavelNome: string;
  responsavelTelefone: string | null;
  emitidoEmLabel: string;
  codigoVerificacao: string;
}

/**
 * Subconjunto de `DadosPedigree` com o que o Crachá realmente exibe (sem
 * genealogia) — `CrachaDocument` aceita este tipo, e `DadosPedigree` o
 * satisfaz estruturalmente, então a rota de Crachá individual continua
 * passando os dados já montados por `montarDadosPedigree` sem mudança.
 */
export interface DadosCracha {
  ave: DadosPedigreeAve;
  criatorioNome: string;
  responsavelNome: string;
  responsavelTelefone: string | null;
}

function formatarData(data: Date | string | null): string {
  if (!data) return "Não informado";
  return new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function formatarDataPorExtenso(data: Date): string {
  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Monta os dados do certificado de pedigree a partir da mesma árvore genealógica
 * de 3 gerações usada na tela de Árvore (Task 4.1/4.2) — nenhuma nova consulta de
 * ancestralidade é criada para o PDF.
 */
export async function montarDadosPedigree(
  aveId: string,
  tenantId: string,
  responsavelNome: string,
): Promise<DadosPedigree> {
  const [ave, arvore, tenant] = await Promise.all([
    getAve(aveId),
    montarArvoreGenealogica(aveId),
    prisma.tenant.findUnique({ where: { id: tenantId } }),
  ]);

  if (!ave) throw new RegistroNaoEncontradoError("Ave");
  if (!tenant) throw new RegistroNaoEncontradoError("Tenant");

  const criatorioNome = tenant.name ?? "Ninhal";

  return {
    ave: {
      nomeApelido: ave.nomeApelido,
      anilha: ave.anilha,
      especieNome: ave.especie.nome,
      mutacaoCor: ave.mutacaoCor,
      sexoLabel: SEXO_AVE_LABELS[ave.sexo],
      dataNascimentoLabel: formatarData(ave.dataNascimento),
      origemLabel: ORIGEM_AVE_LABELS[ave.origem],
      fotoUrl: ave.foto,
      registro: ave.registro,
    },
    arvore,
    criatorioNome,
    criatorioLogoUrl: tenant.logoUrl,
    responsavelNome,
    responsavelTelefone: tenant.telefone,
    emitidoEmLabel: formatarDataPorExtenso(new Date()),
    codigoVerificacao: gerarCodigoVerificacao(ave.anilha, criatorioNome),
  };
}

/**
 * Monta os dados de Crachá para várias aves de uma vez (impressão em lote).
 * Ao contrário de `montarDadosPedigree`, não monta a árvore genealógica de
 * cada ave — o Crachá não a exibe — e busca todas as aves em uma única
 * consulta (`findMany`), em vez de uma consulta por ave, para não repetir o
 * padrão de esgotamento do pool de conexões já visto em produção com listas
 * grandes.
 */
export async function montarDadosCrachaLote(
  aveIds: string[],
  tenantId: string,
  responsavelNome: string,
): Promise<DadosCracha[]> {
  const [aves, tenant] = await Promise.all([
    prisma.ave.findMany({
      where: { id: { in: aveIds } },
      include: { especie: true },
    }),
    prisma.tenant.findUnique({ where: { id: tenantId } }),
  ]);

  if (!tenant) throw new RegistroNaoEncontradoError("Tenant");
  if (aves.length === 0) throw new RegistroNaoEncontradoError("Ave");

  const avesPorId = new Map(aves.map((ave) => [ave.id, ave]));
  const criatorioNome = tenant.name ?? "Ninhal";

  return aveIds
    .map((id) => avesPorId.get(id))
    .filter((ave): ave is NonNullable<typeof ave> => ave !== undefined)
    .map((ave) => ({
      ave: {
        nomeApelido: ave.nomeApelido,
        anilha: ave.anilha,
        especieNome: ave.especie.nome,
        mutacaoCor: ave.mutacaoCor,
        sexoLabel: SEXO_AVE_LABELS[ave.sexo],
        dataNascimentoLabel: formatarData(ave.dataNascimento),
        origemLabel: ORIGEM_AVE_LABELS[ave.origem],
        fotoUrl: ave.foto,
        registro: ave.registro,
      },
      criatorioNome,
      responsavelNome,
      responsavelTelefone: tenant.telefone,
    }));
}

/** Divide uma lista em grupos de tamanho fixo, na ordem original. */
export function agruparEmPaginas<T>(itens: T[], porPagina: number): T[][] {
  const paginas: T[][] = [];
  for (let i = 0; i < itens.length; i += porPagina) {
    paginas.push(itens.slice(i, i + porPagina));
  }
  return paginas;
}
