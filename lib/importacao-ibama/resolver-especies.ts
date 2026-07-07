import { criarOuReaproveitarEspecie } from "@/lib/especies/service";
import type { AveExtraidaIbama } from "./parser";

export interface AveComEspecie extends AveExtraidaIbama {
  especieId: string;
}

/**
 * Resolve a espécie de cada ave extraída do PDF do IBAMA — cria a espécie no
 * catálogo se ausente, ou reaproveita a existente (mesmo com grafia/caixa
 * diferente), anexando o `especieId` resolvido para uso pela tela de revisão
 * (Task 2.4). Nomes comuns repetidos no mesmo lote resolvem uma única vez.
 */
export async function resolverEspeciesDasAves(
  aves: AveExtraidaIbama[],
): Promise<AveComEspecie[]> {
  const cache = new Map<string, string>();
  const resultado: AveComEspecie[] = [];

  for (const ave of aves) {
    const chave = ave.nomeComum.trim().toLowerCase();
    let especieId = cache.get(chave);
    if (!especieId) {
      const { especie } = await criarOuReaproveitarEspecie({ nome: ave.nomeComum });
      especieId = especie.id;
      cache.set(chave, especieId);
    }
    resultado.push({ ...ave, especieId });
  }

  return resultado;
}
