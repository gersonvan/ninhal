"use server";

import { randomUUID } from "node:crypto";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { runWithTenant } from "@/lib/tenant/context";
import { requireTenantOrRedirect } from "@/lib/aves/require-tenant";
import { buscarAvePorAnilha } from "@/lib/aves/service";
import { AnilhaDuplicadaError, RegistroNaoEncontradoError } from "@/lib/aves/errors";
import { ParentescoInvalidoError } from "@/lib/aves/compatibility";
import { extrairDadosIbama } from "./parser";
import { resolverEspeciesDasAves } from "./resolver-especies";
import { executarImportacao } from "./importar";
import type {
  LinhaConfirmacaoIbama,
  LinhaRevisaoIbama,
  ResponsavelSugerido,
} from "./types";

export type ProcessarPdfState =
  | { error: string }
  | {
      linhas: LinhaRevisaoIbama[];
      linhasComErro: { linha: string; motivo: string }[];
      responsavelSugerido: ResponsavelSugerido;
    }
  | null;

export async function processarPdfIbamaAction(
  _prevState: ProcessarPdfState,
  formData: FormData,
): Promise<ProcessarPdfState> {
  const { tenant } = await requireTenantOrRedirect();

  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { error: "Selecione o arquivo PDF da Relação de Passeriformes." };
  }

  const buffer = Buffer.from(await arquivo.arrayBuffer());

  let extraido;
  try {
    extraido = await extrairDadosIbama(buffer);
  } catch {
    return {
      error: "Não foi possível ler o PDF. Confirme que é o arquivo correto do IBAMA.",
    };
  }

  const avesComEspecie = await resolverEspeciesDasAves(extraido.aves);

  const linhas = await runWithTenant(tenant.id, async () => {
    const resultado: LinhaRevisaoIbama[] = [];
    for (const ave of avesComEspecie) {
      const existente = await buscarAvePorAnilha(ave.anilha);
      resultado.push({
        linhaId: randomUUID(),
        nomeApelido: "",
        nomeCientifico: ave.nomeCientifico,
        anilha: ave.anilha,
        especieId: ave.especieId,
        sexo: ave.sexo,
        dataNascimento: ave.dataNascimento
          ? ave.dataNascimento.toISOString().slice(0, 10)
          : "",
        tipoAnilha: ave.tipoAnilha,
        diametroAnilha: ave.diametroAnilha,
        registro: "",
        // O documento do IBAMA não informa origem — "Adquirida" é a regra padrão
        // desta fase, editável pelo usuário antes de confirmar.
        origem: "ADQUIRIDA",
        anilhaPaiId: "",
        anilhaMaeId: "",
        duplicada: Boolean(existente),
        aveExistenteId: existente?.id ?? null,
      });
    }
    return resultado;
  });

  return {
    linhas,
    linhasComErro: extraido.linhasComErro,
    responsavelSugerido: extraido.responsavel,
  };
}

export interface ConfirmarImportacaoPayload {
  linhas: LinhaConfirmacaoIbama[];
  /** Presente apenas quando o usuário confirma explicitamente atualizar nome/telefone. */
  responsavel: { nome?: string; telefone?: string } | null;
}

export type ConfirmarImportacaoState =
  | { error: string }
  | { success: true; criadas: number; atualizadas: number; ignoradas: number }
  | null;

function mapErro(error: unknown): string {
  if (error instanceof ZodError) return "Um ou mais campos estão inválidos.";
  if (
    error instanceof AnilhaDuplicadaError ||
    error instanceof ParentescoInvalidoError ||
    error instanceof RegistroNaoEncontradoError
  ) {
    return error.message;
  }
  throw error;
}

export async function confirmarImportacaoAction(
  payload: ConfirmarImportacaoPayload,
): Promise<ConfirmarImportacaoState> {
  const { supabase, tenant } = await requireTenantOrRedirect();

  let resultado: Awaited<ReturnType<typeof executarImportacao>>;
  try {
    resultado = await runWithTenant(tenant.id, () => executarImportacao(payload.linhas));
  } catch (error) {
    return { error: mapErro(error) };
  }

  const { criadas, atualizadas, ignoradas } = resultado;

  // Sugestão de responsável só é gravada mediante confirmação explícita —
  // `payload.responsavel` só chega preenchido quando o usuário marcou a opção.
  if (payload.responsavel?.nome) {
    await supabase.auth.updateUser({ data: { full_name: payload.responsavel.nome } });
  }
  if (payload.responsavel?.telefone) {
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { telefone: payload.responsavel.telefone },
    });
  }

  return { success: true, criadas, atualizadas, ignoradas };
}
