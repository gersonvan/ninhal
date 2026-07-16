import { describe, expect, it } from "vitest";
import { createAveSchema } from "./schema";

const BASE_INPUT = {
  anilha: "BR-2024-0001",
  especieId: "especie-canario",
  sexo: "MACHO",
  origem: "NASCIDA_NO_CRIATORIO",
};

describe("createAveSchema", () => {
  it("aceita os campos obrigatórios preenchidos", () => {
    expect(() => createAveSchema.parse(BASE_INPUT)).not.toThrow();
  });

  it("exige anilha", () => {
    const { anilha: _anilha, ...rest } = BASE_INPUT;
    expect(() => createAveSchema.parse(rest)).toThrow();
  });

  it("exige especieId", () => {
    const { especieId: _especieId, ...rest } = BASE_INPUT;
    expect(() => createAveSchema.parse(rest)).toThrow();
  });

  it("exige sexo com um dos valores permitidos", () => {
    const { sexo: _sexo, ...rest } = BASE_INPUT;
    expect(() => createAveSchema.parse(rest)).toThrow();
    expect(() =>
      createAveSchema.parse({ ...BASE_INPUT, sexo: "INDEFINIDO" }),
    ).toThrow();
  });

  it("exige origem com um dos valores permitidos", () => {
    const { origem: _origem, ...rest } = BASE_INPUT;
    expect(() => createAveSchema.parse(rest)).toThrow();
    expect(() =>
      createAveSchema.parse({ ...BASE_INPUT, origem: "DESCONHECIDA" }),
    ).toThrow();
  });

  it("não exige os campos opcionais", () => {
    const result = createAveSchema.parse(BASE_INPUT);
    expect(result.nomeApelido).toBeUndefined();
    expect(result.mutacaoCor).toBeUndefined();
    expect(result.dataNascimento).toBeUndefined();
    expect(result.anilhaPaiId).toBeUndefined();
    expect(result.anilhaMaeId).toBeUndefined();
    expect(result.origemDetalhe).toBeUndefined();
  });

  it("aceita origemDetalhe (de onde a ave foi adquirida)", () => {
    const result = createAveSchema.parse({
      ...BASE_INPUT,
      origem: "ADQUIRIDA",
      origemDetalhe: "Criatório Serra Verde",
    });
    expect(result.origemDetalhe).toBe("Criatório Serra Verde");
  });
});
