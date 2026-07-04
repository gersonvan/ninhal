import { describe, expect, it } from "vitest";
import { gerarCodigoVerificacao } from "./verificacao";

describe("gerarCodigoVerificacao", () => {
  it("usa os últimos 4 dígitos da anilha e as iniciais das duas últimas palavras do criatório", () => {
    expect(gerarCodigoVerificacao("BR-2024-0451", "Aviário Serra Verde")).toBe(
      "PDG-0451-SV",
    );
  });

  it("completa com zeros à esquerda quando a anilha tem menos de 4 dígitos", () => {
    expect(gerarCodigoVerificacao("BR-7", "Sítio Alfa")).toBe("PDG-0007-SA");
  });

  it("usa 'NH' quando o nome do criatório está vazio", () => {
    expect(gerarCodigoVerificacao("BR-2024-0451", "")).toBe("PDG-0451-NH");
  });
});
