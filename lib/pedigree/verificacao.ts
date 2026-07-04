/**
 * Código de verificação cosmético do pedigree (ex: "PDG-0451-SV"). Não é
 * consultável — apenas exibido no documento como um selo de identificação visual.
 */
export function gerarCodigoVerificacao(anilha: string, tenantNome: string): string {
  const digitos = anilha.replace(/\D/g, "").slice(-4).padStart(4, "0");

  const palavras = tenantNome.trim().split(/\s+/).filter(Boolean);
  const iniciais =
    palavras
      .slice(-2)
      .map((palavra) => palavra[0]?.toUpperCase() ?? "")
      .join("") || "NH";

  return `PDG-${digitos}-${iniciais}`;
}
