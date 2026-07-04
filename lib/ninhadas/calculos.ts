/**
 * Taxa de eclosão = filhotesNascidos / ovosBotados, como percentual.
 * Campo derivado (não persistido) — só calculado quando ambos os valores estão
 * preenchidos e ovosBotados é maior que zero, evitando divisão por zero.
 */
export function calcularTaxaEclosao(
  ovosBotados: number | null | undefined,
  filhotesNascidos: number | null | undefined,
): number | null {
  if (ovosBotados == null || filhotesNascidos == null) return null;
  if (ovosBotados <= 0) return null;
  return (filhotesNascidos / ovosBotados) * 100;
}
