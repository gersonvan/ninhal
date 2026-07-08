/**
 * Validação da nova senha no fluxo de redefinição.
 * Extraída para fora da action ("use server" só permite exports assíncronos)
 * e para permitir teste unitário puro.
 */
export function validarNovaSenha(
  senha: string,
  confirmacao: string,
): string | null {
  if (senha.length < 6) {
    return "A senha deve ter pelo menos 6 caracteres.";
  }
  if (senha !== confirmacao) {
    return "As senhas não coincidem.";
  }
  return null;
}
