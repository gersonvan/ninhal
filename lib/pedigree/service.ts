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
}

export interface DadosPedigree {
  ave: DadosPedigreeAve;
  arvore: ArvoreGenealogica;
  criatorioNome: string;
  criatorioLogoUrl: string | null;
  responsavelNome: string;
  emitidoEmLabel: string;
  codigoVerificacao: string;
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
    },
    arvore,
    criatorioNome,
    criatorioLogoUrl: tenant.logoUrl,
    responsavelNome,
    emitidoEmLabel: formatarDataPorExtenso(new Date()),
    codigoVerificacao: gerarCodigoVerificacao(ave.anilha, criatorioNome),
  };
}
