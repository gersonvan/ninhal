import { prisma } from "@/lib/prisma";

/** Formata o código da ninhada no padrão AAAA-NN (ex: 2026-01, 2026-12). */
export function formatarCodNinhada(ano: number, sequencia: number): string {
  return `${ano}-${String(sequencia).padStart(2, "0")}`;
}

/**
 * Determina o próximo código sequencial para o ano informado, contando as
 * ninhadas já existentes do tenant do contexto atual com esse prefixo de ano.
 * A sequência reinicia a cada virada de ano.
 */
export async function gerarProximoCodNinhada(ano: number): Promise<string> {
  const prefixo = `${ano}-`;
  const quantidadeExistente = await prisma.ninhada.count({
    where: { codNinhada: { startsWith: prefixo } },
  });
  return formatarCodNinhada(ano, quantidadeExistente + 1);
}
