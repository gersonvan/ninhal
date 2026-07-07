import { describe, expect, it } from "vitest";
import { gerarPdfSinteticoIbama } from "./fixtures/gerar-pdf-sintetico";
import { extrairDadosIbama } from "./parser";

describe("extrairDadosIbama", () => {
  it("extrai corretamente cada coluna das aves e a identificação do responsável", async () => {
    const pdf = await gerarPdfSinteticoIbama({
      linhas: [
        {
          numero: "1",
          nomeCientifico: "Sicalis flaveola",
          nomeComum: "Canário-da-terra",
          sexo: "M",
          nascimento: "15/03/2022",
          tipoAnilha: "Fechada",
          diametro: "2,5",
          anilha: "BR12345678",
        },
        {
          numero: "2",
          nomeCientifico: "Sporophila caerulescens",
          nomeComum: "Coleirinho",
          sexo: "F",
          nascimento: "20/07/2023",
          tipoAnilha: "Aberta",
          diametro: "2,0",
          anilha: "BR87654321",
        },
        {
          numero: "3",
          nomeCientifico: "Paroaria dominicana",
          nomeComum: "Galo-da-campina",
          sexo: "I",
          nascimento: "01/01/2021",
          tipoAnilha: "Fechada",
          diametro: "3,0",
          anilha: "BR11223344",
        },
      ],
      nomeResponsavel: "Fulano de Teste Sintético",
      telefoneResponsavel: "(11) 91234-5678",
    });

    const resultado = await extrairDadosIbama(pdf);

    expect(resultado.linhasComErro).toEqual([]);
    expect(resultado.aves).toHaveLength(3);

    expect(resultado.aves[0]).toEqual({
      numero: "1",
      nomeCientifico: "Sicalis flaveola",
      nomeComum: "Canário-da-terra",
      sexo: "MACHO",
      dataNascimento: new Date(Date.UTC(2022, 2, 15)),
      tipoAnilha: "Fechada",
      diametroAnilha: "2,5",
      anilha: "BR12345678",
    });

    expect(resultado.aves[1].sexo).toBe("FEMEA");
    expect(resultado.aves[2].sexo).toBe("NAO_SEXADO");

    expect(resultado.responsavel).toEqual({
      nome: "Fulano de Teste Sintético",
      telefone: "(11) 91234-5678",
    });
  });

  it("não extrai CPF ou endereço mesmo se presentes no texto", async () => {
    const pdf = await gerarPdfSinteticoIbama({
      linhas: [
        {
          numero: "1",
          nomeCientifico: "Sicalis flaveola",
          nomeComum: "Canário-da-terra",
          sexo: "M",
          nascimento: "15/03/2022",
          tipoAnilha: "Fechada",
          diametro: "2,5",
          anilha: "BR12345678",
        },
      ],
      nomeResponsavel: "Fulano de Teste Sintético",
      telefoneResponsavel: "(11) 91234-5678",
    });

    const resultado = await extrairDadosIbama(pdf);

    expect(resultado.responsavel).not.toHaveProperty("cpf");
    expect(resultado.responsavel).not.toHaveProperty("endereco");
  });

  it("trata defensivamente uma linha com sexo em formato inesperado", async () => {
    const pdf = await gerarPdfSinteticoIbama({
      linhas: [
        {
          numero: "1",
          nomeCientifico: "Sicalis flaveola",
          nomeComum: "Canário-da-terra",
          sexo: "X",
          nascimento: "15/03/2022",
          tipoAnilha: "Fechada",
          diametro: "2,5",
          anilha: "BR12345678",
        },
        {
          numero: "2",
          nomeCientifico: "Sporophila caerulescens",
          nomeComum: "Coleirinho",
          sexo: "F",
          nascimento: "20/07/2023",
          tipoAnilha: "Aberta",
          diametro: "2,0",
          anilha: "BR87654321",
        },
      ],
    });

    const resultado = await extrairDadosIbama(pdf);

    expect(resultado.aves).toHaveLength(1);
    expect(resultado.aves[0].anilha).toBe("BR87654321");
    expect(resultado.linhasComErro).toHaveLength(1);
    expect(resultado.linhasComErro[0].motivo).toMatch(/sexo inválido/i);
  });

  it("trata defensivamente uma linha sem código de anilha", async () => {
    const pdf = await gerarPdfSinteticoIbama({
      linhas: [
        {
          numero: "1",
          nomeCientifico: "Sicalis flaveola",
          nomeComum: "Canário-da-terra",
          sexo: "M",
          nascimento: "15/03/2022",
          tipoAnilha: "Fechada",
          diametro: "2,5",
          anilha: "",
        },
      ],
    });

    const resultado = await extrairDadosIbama(pdf);

    expect(resultado.aves).toHaveLength(0);
    expect(resultado.linhasComErro).toHaveLength(1);
    expect(resultado.linhasComErro[0].motivo).toMatch(/anilha ausente/i);
  });

  it("retorna nascimento nulo (sem lançar) quando a data não segue o formato esperado", async () => {
    const pdf = await gerarPdfSinteticoIbama({
      linhas: [
        {
          numero: "1",
          nomeCientifico: "Sicalis flaveola",
          nomeComum: "Canário-da-terra",
          sexo: "M",
          nascimento: "data desconhecida",
          tipoAnilha: "Fechada",
          diametro: "2,5",
          anilha: "BR12345678",
        },
      ],
    });

    const resultado = await extrairDadosIbama(pdf);

    expect(resultado.aves).toHaveLength(1);
    expect(resultado.aves[0].dataNascimento).toBeNull();
  });

  it("retorna nome/telefone nulos quando a seção de identificação não está presente", async () => {
    const pdf = await gerarPdfSinteticoIbama({
      linhas: [
        {
          numero: "1",
          nomeCientifico: "Sicalis flaveola",
          nomeComum: "Canário-da-terra",
          sexo: "M",
          nascimento: "15/03/2022",
          tipoAnilha: "Fechada",
          diametro: "2,5",
          anilha: "BR12345678",
        },
      ],
    });

    const resultado = await extrairDadosIbama(pdf);

    expect(resultado.responsavel).toEqual({ nome: null, telefone: null });
  });
});
