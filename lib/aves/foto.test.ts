import { afterEach, describe, expect, it, vi } from "vitest";
import { TAMANHO_MAXIMO_FOTO_MB, redimensionarFoto, validarTamanhoFoto } from "./foto";

function arquivoDeTamanho(bytes: number): File {
  return new File([new Uint8Array(bytes)], "foto.jpg", { type: "image/jpeg" });
}

describe("validarTamanhoFoto", () => {
  it("aceita um arquivo dentro do limite", () => {
    const arquivo = arquivoDeTamanho(2 * 1024 * 1024);
    expect(validarTamanhoFoto(arquivo)).toBeNull();
  });

  it("aceita um arquivo exatamente no limite", () => {
    const arquivo = arquivoDeTamanho(TAMANHO_MAXIMO_FOTO_MB * 1024 * 1024);
    expect(validarTamanhoFoto(arquivo)).toBeNull();
  });

  it("rejeita um arquivo acima do limite com mensagem em português", () => {
    const arquivo = arquivoDeTamanho(TAMANHO_MAXIMO_FOTO_MB * 1024 * 1024 + 1);
    const erro = validarTamanhoFoto(arquivo);
    expect(erro).not.toBeNull();
    expect(erro).toContain(`${TAMANHO_MAXIMO_FOTO_MB}MB`);
  });
});

describe("redimensionarFoto", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // O ambiente de teste (Node, sem DOM) não tem `createImageBitmap`/`canvas`
  // reais — o valor de um teste aqui não é exercitar o redimensionamento em
  // si (isso é verificado manualmente no navegador), e sim garantir que,
  // quando essas APIs de navegador falham ou não existem, a função não
  // quebra o formulário: ela recua para devolver o arquivo original, que
  // ainda passa pela rede de segurança de `validarTamanhoFoto`.
  it("devolve o arquivo original quando createImageBitmap não está disponível/falha", async () => {
    vi.stubGlobal("createImageBitmap", undefined);
    const arquivo = arquivoDeTamanho(1024);

    const resultado = await redimensionarFoto(arquivo);

    expect(resultado).toBe(arquivo);
  });
});
