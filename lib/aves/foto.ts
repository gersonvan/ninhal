/**
 * Limite de tamanho de foto no cliente, alinhado ao `bodySizeLimit` das
 * Server Actions configurado em `next.config.ts` — sem essa validação
 * client-side, o usuário só descobre que a foto é grande demais depois de
 * esperar o upload e receber um erro genérico de servidor.
 */
export const TAMANHO_MAXIMO_FOTO_MB = 8;
const TAMANHO_MAXIMO_FOTO_BYTES = TAMANHO_MAXIMO_FOTO_MB * 1024 * 1024;

export function validarTamanhoFoto(arquivo: File): string | null {
  if (arquivo.size > TAMANHO_MAXIMO_FOTO_BYTES) {
    return `Foto muito grande (máx. ${TAMANHO_MAXIMO_FOTO_MB}MB). Tente uma foto menor ou tire um print reduzido antes de enviar.`;
  }
  return null;
}
