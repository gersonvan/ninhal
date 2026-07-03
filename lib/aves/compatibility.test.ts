import { describe, expect, it } from "vitest";
import {
  ParentescoInvalidoError,
  assertMaeCompativel,
  assertPaiCompativel,
} from "./compatibility";

const CANARIO = "especie-canario";
const CALOPSITA = "especie-calopsita";

describe("assertPaiCompativel", () => {
  it("aceita um pai da mesma espécie e sexo Macho", () => {
    expect(() =>
      assertPaiCompativel({ especieId: CANARIO, sexo: "MACHO" }, CANARIO),
    ).not.toThrow();
  });

  it("rejeita um pai de espécie diferente", () => {
    expect(() =>
      assertPaiCompativel({ especieId: CALOPSITA, sexo: "MACHO" }, CANARIO),
    ).toThrow(ParentescoInvalidoError);
  });

  it("rejeita um pai que não seja do sexo Macho", () => {
    expect(() =>
      assertPaiCompativel({ especieId: CANARIO, sexo: "FEMEA" }, CANARIO),
    ).toThrow(ParentescoInvalidoError);
    expect(() =>
      assertPaiCompativel(
        { especieId: CANARIO, sexo: "NAO_SEXADO" },
        CANARIO,
      ),
    ).toThrow(ParentescoInvalidoError);
  });
});

describe("assertMaeCompativel", () => {
  it("aceita uma mãe da mesma espécie e sexo Fêmea", () => {
    expect(() =>
      assertMaeCompativel({ especieId: CANARIO, sexo: "FEMEA" }, CANARIO),
    ).not.toThrow();
  });

  it("rejeita uma mãe de espécie diferente", () => {
    expect(() =>
      assertMaeCompativel({ especieId: CALOPSITA, sexo: "FEMEA" }, CANARIO),
    ).toThrow(ParentescoInvalidoError);
  });

  it("rejeita uma mãe que não seja do sexo Fêmea", () => {
    expect(() =>
      assertMaeCompativel({ especieId: CANARIO, sexo: "MACHO" }, CANARIO),
    ).toThrow(ParentescoInvalidoError);
  });
});
