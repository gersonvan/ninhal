/** Saudação conforme a hora local do criador (design/03 Dashboard: "Bom dia, Carlos"). */
export function saudacao(hora: number): string {
  if (hora >= 5 && hora < 12) return "Bom dia";
  if (hora >= 12 && hora < 18) return "Boa tarde";
  return "Boa noite";
}

/** Hora atual no fuso do Brasil, onde está o público do produto. */
export function horaAtualBrasil(agora: Date = new Date()): number {
  return Number(
    new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "numeric",
      hour12: false,
    }).format(agora),
  );
}
