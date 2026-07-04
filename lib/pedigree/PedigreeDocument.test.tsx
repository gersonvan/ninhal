import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import PedigreeDocument from "./PedigreeDocument";
import type { DadosPedigree } from "./service";

/**
 * Extrai recursivamente todo texto de uma árvore de elementos React (sem
 * renderizar via react-pdf/renderer — apenas inspeciona a estrutura de
 * elementos retornada pelo componente, conforme pedido pela Task).
 */
function extrairTextos(no: ReactNode): string[] {
  if (no === null || no === undefined || typeof no === "boolean") return [];
  if (typeof no === "string" || typeof no === "number") return [String(no)];
  if (Array.isArray(no)) return no.flatMap(extrairTextos);
  if (typeof no === "object" && "type" in no && "props" in no) {
    // Elemento de um componente de função próprio (ex: <CartaoAncestral />):
    // invoca a função com suas props para obter a árvore que ela renderiza,
    // já que o elemento em si ainda não foi "executado".
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
  emitidoEmLabel: "02 de julho de 2026",
  codigoVerificacao: "PDG-0451-SV",
};

describe("PedigreeDocument", () => {
  it("contém a seção da ave consultada (nome, anilha, espécie, nascimento, origem)", () => {
    const textos = extrairTextos(PedigreeDocument({ dados: DADOS_TESTE }));
    const texto = textos.join(" ");

    expect(texto).toContain("Amália");
    expect(texto).toContain("BR-2024-0451");
    expect(texto).toContain("Canário Belga");
    expect(texto).toContain("Isabela");
    expect(texto).toContain("Fêmea");
    expect(texto).toContain("12/03/2024");
    expect(texto).toContain("Nascida no criatório");
  });

  it("contém a seção de pais (nomes e anilhas)", () => {
    const textos = extrairTextos(PedigreeDocument({ dados: DADOS_TESTE }));
    const texto = textos.join(" ");

    expect(texto).toContain("Rufus");
    expect(texto).toContain("BR-2021-0099");
    expect(texto).toContain("Alice");
    expect(texto).toContain("BR-2021-0075");
  });

  it("contém a seção de avós, incluindo os rótulos de ausência corretos", () => {
    const textos = extrairTextos(PedigreeDocument({ dados: DADOS_TESTE }));
    const texto = textos.join(" ");

    expect(texto).toContain("Adquirido — sem registro");
    expect(texto).toContain("Adquirida — sem registro");
    expect(texto).toContain("Não registrado");
    expect(texto).toContain("Não registrada");
  });

  it("contém a identidade do criatório e o responsável", () => {
    const textos = extrairTextos(PedigreeDocument({ dados: DADOS_TESTE }));
    const texto = textos.join(" ");

    expect(texto).toContain("AVIÁRIO SERRA VERDE");
    expect(texto).toContain("Carlos Menezes");
  });

  it("contém o código de verificação", () => {
    const textos = extrairTextos(PedigreeDocument({ dados: DADOS_TESTE }));
    const texto = textos.join(" ");

    expect(texto).toContain("PDG-0451-SV");
  });
});
