import { createAve, updateAve } from "@/lib/aves/service";
import type { LinhaConfirmacaoIbama } from "./types";

export interface ResultadoImportacao {
  criadas: number;
  atualizadas: number;
  ignoradas: number;
}

/**
 * Executa a gravação final da importação do IBAMA — deve ser chamada dentro
 * de `runWithTenant`. Extraído da Server Action (`actions.ts`) para ser
 * testável isoladamente, sem depender do contexto de cookies/sessão do
 * Next.js (mesmo motivo da extração de `buildSignUpPayload`, Task 4.5).
 */
export async function executarImportacao(
  linhas: LinhaConfirmacaoIbama[],
): Promise<ResultadoImportacao> {
  let criadas = 0;
  let atualizadas = 0;
  let ignoradas = 0;

  for (const linha of linhas) {
    const dadosAve = {
      anilha: linha.anilha,
      nomeApelido: linha.nomeApelido || undefined,
      especieId: linha.especieId,
      sexo: linha.sexo,
      dataNascimento: linha.dataNascimento || undefined,
      origem: linha.origem,
      anilhaPaiId: linha.anilhaPaiId || undefined,
      anilhaMaeId: linha.anilhaMaeId || undefined,
      registro: linha.registro || undefined,
      nomeCientifico: linha.nomeCientifico || undefined,
      tipoAnilha: linha.tipoAnilha || undefined,
      diametroAnilha: linha.diametroAnilha || undefined,
    };

    if (linha.duplicada) {
      if (linha.atualizarExistente && linha.aveExistenteId) {
        await updateAve(linha.aveExistenteId, dadosAve);
        atualizadas++;
      } else {
        // Duplicada e o usuário não confirmou atualizar: pula a linha —
        // nunca cria uma duplicata nem sobrescreve silenciosamente.
        ignoradas++;
      }
    } else {
      await createAve(dadosAve);
      criadas++;
    }
  }

  return { criadas, atualizadas, ignoradas };
}
