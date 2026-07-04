import { describe, expect, it } from "vitest";
import { calcularTaxaEclosao } from "./calculos";

describe("calcularTaxaEclosao", () => {
  it("calcula o percentual quando ambos os valores estão presentes", () => {
    expect(calcularTaxaEclosao(10, 7)).toBe(70);
    expect(calcularTaxaEclosao(4, 1)).toBe(25);
  });

  it("retorna null quando ovosBotados está ausente", () => {
    expect(calcularTaxaEclosao(null, 5)).toBeNull();
    expect(calcularTaxaEclosao(undefined, 5)).toBeNull();
  });

  it("retorna null quando filhotesNascidos está ausente", () => {
    expect(calcularTaxaEclosao(10, null)).toBeNull();
    expect(calcularTaxaEclosao(10, undefined)).toBeNull();
  });

  it("retorna null quando ovosBotados é zero (evita divisão por zero)", () => {
    expect(calcularTaxaEclosao(0, 0)).toBeNull();
  });

  it("retorna null quando ambos os valores estão ausentes", () => {
    expect(calcularTaxaEclosao(null, null)).toBeNull();
  });
});
