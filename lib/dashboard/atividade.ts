/**
 * Montagem da lista de "Atividade recente" do Dashboard a partir dos
 * cadastros de aves e ninhadas (design/03 Dashboard.dc.html).
 */

export interface AtividadeItem {
  tipo: "ave" | "ninhada";
  /** Nome de exibição da ave ou código da ninhada. */
  titulo: string;
  createdAt: Date;
}

export function formatarTempoRelativo(data: Date, agora: Date): string {
  const MS_POR_DIA = 24 * 60 * 60 * 1000;
  const inicioDoDia = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

  const dias = Math.round((inicioDoDia(agora) - inicioDoDia(data)) / MS_POR_DIA);
  if (dias <= 0) return "hoje";
  if (dias === 1) return "ontem";
  return `${dias} dias atrás`;
}

export function montarAtividadeRecente(
  aves: { nomeApelido: string | null; anilha: string; createdAt: Date }[],
  ninhadas: { codNinhada: string; createdAt: Date }[],
  limite = 4,
): AtividadeItem[] {
  const itens: AtividadeItem[] = [
    ...aves.map((ave) => ({
      tipo: "ave" as const,
      titulo: ave.nomeApelido || ave.anilha,
      createdAt: ave.createdAt,
    })),
    ...ninhadas.map((ninhada) => ({
      tipo: "ninhada" as const,
      titulo: `#${ninhada.codNinhada}`,
      createdAt: ninhada.createdAt,
    })),
  ];

  return itens
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limite);
}
