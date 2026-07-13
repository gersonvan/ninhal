/**
 * Limite de tamanho de foto no cliente, alinhado ao `bodySizeLimit` das
 * Server Actions configurado em `next.config.ts` — rede de segurança para o
 * caso (raro) de `redimensionarFoto` falhar ou não conseguir reduzir o
 * suficiente; o caminho normal é a foto já sair pequena do redimensionamento.
 */
export const TAMANHO_MAXIMO_FOTO_MB = 8;
const TAMANHO_MAXIMO_FOTO_BYTES = TAMANHO_MAXIMO_FOTO_MB * 1024 * 1024;

export function validarTamanhoFoto(arquivo: File): string | null {
  if (arquivo.size > TAMANHO_MAXIMO_FOTO_BYTES) {
    return `Foto muito grande (máx. ${TAMANHO_MAXIMO_FOTO_MB}MB). Tente uma foto menor ou tire um print reduzido antes de enviar.`;
  }
  return null;
}

/**
 * Maior lado da foto após redimensionamento. Suficiente tanto para a
 * impressão do Crachá (círculo de 68pt ≈ 2,4cm, ~283px a 300 DPI — muito
 * abaixo disso) quanto para o banner full-width da Ficha da Ave em telas de
 * alta densidade (até ~640px de largura, o dobro em retina).
 */
const LADO_MAXIMO_PX = 1600;
const QUALIDADE_JPEG = 0.85;

/**
 * Redimensiona e recomprime a foto no navegador antes do envio, para que
 * fotos de câmera de celular (comumente vários MB, milhares de pixels de
 * lado) caibam no limite de corpo das Server Actions sem o usuário precisar
 * escolher manualmente uma foto menor. Se o redimensionamento falhar por
 * qualquer motivo, retorna o arquivo original — `validarTamanhoFoto` ainda
 * roda depois como rede de segurança.
 */
export async function redimensionarFoto(arquivo: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(arquivo);
    const escala = Math.min(1, LADO_MAXIMO_PX / Math.max(bitmap.width, bitmap.height));
    const largura = Math.round(bitmap.width * escala);
    const altura = Math.round(bitmap.height * escala);

    const canvas = document.createElement("canvas");
    canvas.width = largura;
    canvas.height = altura;
    const contexto = canvas.getContext("2d");
    if (!contexto) return arquivo;

    contexto.drawImage(bitmap, 0, 0, largura, altura);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", QUALIDADE_JPEG),
    );
    if (!blob) return arquivo;

    const nomeBase = arquivo.name.replace(/\.[^./\\]+$/, "");
    return new File([blob], `${nomeBase}.jpg`, { type: "image/jpeg" });
  } catch {
    return arquivo;
  }
}
