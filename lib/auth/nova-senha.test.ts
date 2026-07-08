import { describe, expect, it } from "vitest";
import { validarNovaSenha } from "./nova-senha";

describe("validarNovaSenha", () => {
  it("aceita senha válida com confirmação igual", () => {
    expect(validarNovaSenha("senha123", "senha123")).toBeNull();
  });

  it("rejeita senha com menos de 6 caracteres", () => {
    expect(validarNovaSenha("abc12", "abc12")).toBe(
      "A senha deve ter pelo menos 6 caracteres.",
    );
  });

  it("rejeita quando a confirmação não coincide", () => {
    expect(validarNovaSenha("senha123", "senha124")).toBe(
      "As senhas não coincidem.",
    );
  });

  it("rejeita senha vazia", () => {
    expect(validarNovaSenha("", "")).toBe(
      "A senha deve ter pelo menos 6 caracteres.",
    );
  });

  it("valida o tamanho antes da coincidência", () => {
    expect(validarNovaSenha("abc", "xyz")).toBe(
      "A senha deve ter pelo menos 6 caracteres.",
    );
  });
});
