import { describe, expect, it } from "vitest";
import { TAMANHO_MAXIMO_FOTO_MB, validarTamanhoFoto } from "./foto";

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
