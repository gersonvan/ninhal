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

  it("reconstrói corretamente um código de anilha longo que quebra de linha sem espaço natural (sem hífen espúrio)", async () => {
    // Confirmado empiricamente: uma anilha longa sem espaços quebra de linha
    // dentro da célula e o pdf-parse insere um hífen literal no ponto da
    // quebra (ex: "VERIFYE2E0001234" → "VERI-\nFYE2E0001234" na saída bruta
    // de getTable()) — sem a correção, isso vira "VERI- FYE2E0001234".
    const anilhaOriginal = "VERIFYE2E0001234";
    const pdf = await gerarPdfSinteticoIbama({
      linhas: [
        {
          numero: "1",
          nomeCientifico: "Sicalis flaveola",
          nomeComum: "Canário",
          sexo: "M",
          nascimento: "15/03/2022",
          tipoAnilha: "Fechada",
          diametro: "2,5",
          anilha: anilhaOriginal,
        },
      ],
    });

    const resultado = await extrairDadosIbama(pdf);

    expect(resultado.linhasComErro).toEqual([]);
    expect(resultado.aves[0].anilha).toBe(anilhaOriginal);
  });

  it("preserva um hífen legítimo do valor original mesmo quando a célula quebra de linha em outro ponto", async () => {
    // Confirmado empiricamente: "GaloXXXXXXXX-da-campina" quebra de linha em
    // dois pontos que não coincidem com o hífen legítimo "-da-" (saída bruta:
    // "Ga-\nloXXXXXXXX-da-camp-\nina") — o hífen legítimo deve sobreviver.
    const nomeComumOriginal = "GaloXXXXXXXX-da-campina";
    const pdf = await gerarPdfSinteticoIbama({
      linhas: [
        {
          numero: "1",
          nomeCientifico: "Paroaria dominicana",
          nomeComum: nomeComumOriginal,
          sexo: "M",
          nascimento: "15/03/2022",
          tipoAnilha: "Fechada",
          diametro: "2,5",
          anilha: "BR12345678",
        },
      ],
    });

    const resultado = await extrairDadosIbama(pdf);

    expect(resultado.linhasComErro).toEqual([]);
    expect(resultado.aves[0].nomeComum).toBe(nomeComumOriginal);
  });

  it("preserva um hífen legítimo curto sem nenhuma quebra de linha (caso trivial)", async () => {
    const pdf = await gerarPdfSinteticoIbama({
      linhas: [
        {
          numero: "1",
          nomeCientifico: "Paroaria dominicana",
          nomeComum: "Galo-da-campina",
          sexo: "M",
          nascimento: "15/03/2022",
          tipoAnilha: "Fechada",
          diametro: "2,5",
          anilha: "BR12345678",
        },
      ],
    });

    const resultado = await extrairDadosIbama(pdf);

    expect(resultado.aves[0].nomeComum).toBe("Galo-da-campina");
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

  describe("truncamento silencioso da coluna de anilha (Task 2.6)", () => {
    // Confirmado empiricamente: nesta fixture, um valor de anilha sem espaço
    // com até 20 caracteres é extraído por completo; acima de 20, o
    // pdf-parse/getTable() corta o valor para exatamente 20 caracteres, sem
    // quebra de linha nem hífen — perda real de caracteres, não apenas
    // formatação incorreta (achado da Task 2.5, corrigido nesta Task). Um
    // valor truncado sempre sai com exatamente 20 caracteres — o mesmo
    // comprimento de um valor genuinamente correto de 20 caracteres — então
    // o limite de detecção é deliberadamente conservador (>=, não >) e
    // também sinaliza o caso-limite de exatamente 20 caracteres.
    it.each([16, 18])(
      "extrai corretamente um valor de %i caracteres (claramente dentro do limite)",
      async (n) => {
        const anilha = "A".repeat(n);
        const pdf = await gerarPdfSinteticoIbama({
          linhas: [
            {
              numero: "1",
              nomeCientifico: "Sicalis flaveola",
              nomeComum: "Canario",
              sexo: "M",
              nascimento: "15/03/2022",
              tipoAnilha: "Fechada",
              diametro: "2,5",
              anilha,
            },
          ],
        });

        const resultado = await extrairDadosIbama(pdf);

        expect(resultado.linhasComErro).toEqual([]);
        expect(resultado.aves[0].anilha).toBe(anilha);
      },
    );

    it.each([20, 21, 23, 25, 30])(
      "reporta a linha como erro em vez de aceitar silenciosamente um valor possivelmente truncado (%i caracteres)",
      async (n) => {
        const anilha = "A".repeat(n);
        const pdf = await gerarPdfSinteticoIbama({
          linhas: [
            {
              numero: "1",
              nomeCientifico: "Sicalis flaveola",
              nomeComum: "Canario",
              sexo: "M",
              nascimento: "15/03/2022",
              tipoAnilha: "Fechada",
              diametro: "2,5",
              anilha,
            },
          ],
        });

        const resultado = await extrairDadosIbama(pdf);

        // Nunca deve aparecer em `aves` com um valor incompleto (perda silenciosa).
        expect(resultado.aves).toHaveLength(0);
        expect(resultado.linhasComErro).toHaveLength(1);
        expect(resultado.linhasComErro[0].motivo).toMatch(/truncad/i);
      },
    );
  });
});
