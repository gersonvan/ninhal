import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import CrachaDocument from "./CrachaDocument";
import type { DadosPedigree } from "./service";

/**
 * Extrai recursivamente todo texto de uma árvore de elementos React (mesma
 * técnica usada em PedigreeDocument.test.tsx — sem renderizar via
 * react-pdf/renderer, apenas inspeciona a estrutura de elementos retornada).
 */
function extrairTextos(no: ReactNode): string[] {
  if (no === null || no === undefined || typeof no === "boolean") return [];
  if (typeof no === "string" || typeof no === "number") return [String(no)];
  if (Array.isArray(no)) return no.flatMap(extrairTextos);
  if (typeof no === "object" && "type" in no && "props" in no) {
    if (typeof no.type === "function") {
      const componente = no.type as (props: unknown) => ReactNode;
      return extrairTextos(componente(no.props));
    }
    const filhos = (no.props as { children?: ReactNode }).children;
    return extrairTextos(filhos);
  }
  return [];
}

const DADOS_TESTE: DadosPedigree = {
  ave: {
    nomeApelido: "Amália",
    anilha: "BR-2024-0451",
    especieNome: "Canário Belga",
    mutacaoCor: "Isabela",
    sexoLabel: "Fêmea",
    dataNascimentoLabel: "12/03/2024",
    origemLabel: "Nascida no criatório",
    fotoUrl: null,
    registro: "IBAMA-12345/2024",
  },
  arvore: {
    ave: {
      conhecido: true,
      id: "amalia",
      nomeApelido: "Amália",
      anilha: "BR-2024-0451",
      sexo: "FEMEA",
      origem: "NASCIDA_NO_CRIATORIO",
    },
    pai: {
      conhecido: true,
      id: "rufus",
      nomeApelido: "Rufus",
      anilha: "BR-2021-0099",
      sexo: "MACHO",
      origem: "ADQUIRIDA",
    },
    mae: {
      conhecido: true,
      id: "alice",
      nomeApelido: "Alice",
      anilha: "BR-2021-0075",
      sexo: "FEMEA",
      origem: "ADQUIRIDA",
    },
    paiDoPai: {
      conhecido: false,
      motivo: "ADQUIRIDO_SEM_REGISTRO",
      label: "Adquirido — sem registro",
    },
    maeDoPai: {
      conhecido: false,
      motivo: "ADQUIRIDO_SEM_REGISTRO",
      label: "Adquirida — sem registro",
    },
    paiDaMae: {
      conhecido: false,
      motivo: "NAO_REGISTRADO",
      label: "Não registrado",
    },
    maeDaMae: {
      conhecido: false,
      motivo: "NAO_REGISTRADO",
      label: "Não registrada",
    },
  },
  criatorioNome: "Aviário Serra Verde",
  criatorioLogoUrl: null,
  responsavelNome: "Carlos Menezes",
  responsavelTelefone: "(11) 91234-5678",
  emitidoEmLabel: "02 de julho de 2026",
  codigoVerificacao: "PDG-0451-SV",
};

describe("CrachaDocument", () => {
  it("contém os dados de identificação da ave (nome, anilha, espécie, nascimento, sexo, registro)", () => {
    const texto = extrairTextos(CrachaDocument({ dados: DADOS_TESTE })).join(" ");

    expect(texto).toContain("Amália");
    expect(texto).toContain("BR-2024-0451");
    expect(texto).toContain("Canário Belga");
    expect(texto).toContain("Fêmea");
    expect(texto).toContain("12/03/2024");
    expect(texto).toContain("IBAMA-12345/2024");
  });

  it("contém a árvore genealógica de 3 gerações (pais e avós)", () => {
    const texto = extrairTextos(CrachaDocument({ dados: DADOS_TESTE })).join(" ");

    expect(texto).toContain("Rufus");
    expect(texto).toContain("BR-2021-0099");
    expect(texto).toContain("Alice");
    expect(texto).toContain("BR-2021-0075");
    expect(texto).toContain("Adquirido — sem registro");
    expect(texto).toContain("Adquirida — sem registro");
    expect(texto).toContain("Não registrado");
    expect(texto).toContain("Não registrada");
  });

  it("contém os dados do responsável (nome e telefone) e do criatório", () => {
    const texto = extrairTextos(CrachaDocument({ dados: DADOS_TESTE })).join(" ");

    expect(texto).toContain("Carlos Menezes");
    expect(texto).toContain("(11) 91234-5678");
    expect(texto).toContain("Aviário Serra Verde");
  });

  it("indica claramente quando registro ou telefone não estão informados", () => {
    const dadosSemExtras: DadosPedigree = {
      ...DADOS_TESTE,
      ave: { ...DADOS_TESTE.ave, registro: null },
      responsavelTelefone: null,
    };
    const texto = extrairTextos(CrachaDocument({ dados: dadosSemExtras })).join(" ");

    expect(texto).toContain("Não informado");
    expect(texto).toContain("Telefone não informado");
  });
});
