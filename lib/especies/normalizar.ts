/** Capitaliza a primeira letra de cada palavra (ex: "canário belga" → "Canário Belga"). */
export function normalizarNomeEspecie(nome: string): string {
  return nome
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
    .join(" ");
}
