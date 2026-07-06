import { describe, expect, it } from "vitest";
import { normalizarNomeEspecie } from "./normalizar";

describe("normalizarNomeEspecie", () => {
  it("capitaliza a primeira letra de cada palavra", () => {
    expect(normalizarNomeEspecie("canário belga")).toBe("Canário Belga");
  });

  it("normaliza uma entrada totalmente em maiúsculas", () => {
    expect(normalizarNomeEspecie("CANÁRIO BELGA")).toBe("Canário Belga");
  });

  it("remove espaços extras e colapsa espaços internos", () => {
    expect(normalizarNomeEspecie("  canário   belga  ")).toBe("Canário Belga");
  });

  it("mantém uma única palavra corretamente capitalizada", () => {
    expect(normalizarNomeEspecie("calopsita")).toBe("Calopsita");
  });
});
