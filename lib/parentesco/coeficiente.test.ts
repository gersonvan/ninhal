import { describe, expect, it } from "vitest";
import {
  calcularCoeficienteParentesco,
  type NoParentesco,
} from "./coeficiente";

function no(
  id: string,
  pai: NoParentesco | null = null,
  mae: NoParentesco | null = null,
): NoParentesco {
  return { id, pai, mae };
}

/** Ave fundadora, sem ancestrais conhecidos (trata-se como não-aparentada com qualquer outra). */
function fundador(id: string): NoParentesco {
  return no(id);
}

describe("calcularCoeficienteParentesco", () => {
  it("pai/mãe-filho direto → 25%", () => {
    const pai = fundador("pai");
    const mae = fundador("mae-desconhecida");
    const filho = no("filho", pai, mae);

    expect(calcularCoeficienteParentesco(pai, filho)).toBeCloseTo(25);
  });

  it("irmãos completos (mesmo pai e mesma mãe) → 25%", () => {
    const pai = fundador("pai-comum");
    const mae = fundador("mae-comum");
    const irmao1 = no("irmao1", pai, mae);
    const irmao2 = no("irmao2", pai, mae);

    expect(calcularCoeficienteParentesco(irmao1, irmao2)).toBeCloseTo(25);
  });

  it("meio-irmãos (um dos pais em comum) → 12,5%", () => {
    const paiComum = fundador("pai-comum-meio");
    const maeA = fundador("mae-a");
    const maeB = fundador("mae-b");
    const a = no("meio-irmao-a", paiComum, maeA);
    const b = no("meio-irmao-b", paiComum, maeB);

    expect(calcularCoeficienteParentesco(a, b)).toBeCloseTo(12.5);
  });

  it("avô/avó-neto → 12,5%", () => {
    const avo = fundador("avo");
    const outraAvo = fundador("avo-conjuge");
    const paiIntermediario = no("pai-intermediario", avo, outraAvo);
    const outraMae = fundador("mae-do-neto");
    const neto = no("neto", paiIntermediario, outraMae);

    expect(calcularCoeficienteParentesco(avo, neto)).toBeCloseTo(12.5);
  });

  it("um avô/avó em comum (primos de primeiro grau, pais são irmãos completos) → 6,25%", () => {
    const avoComum1 = fundador("avo-comum-1");
    const avoComum2 = fundador("avo-comum-2");
    const paiDeA = no("pai-de-a", avoComum1, avoComum2);
    const paiDeB = no("pai-de-b", avoComum1, avoComum2);
    const a = no("primo-a", paiDeA, fundador("mae-de-a"));
    const b = no("primo-b", paiDeB, fundador("mae-de-b"));

    expect(calcularCoeficienteParentesco(a, b)).toBeCloseTo(6.25);
  });

  it("nenhum ancestral em comum dentro das 3 gerações rastreadas → 0%", () => {
    const a = no(
      "sem-parentesco-a",
      no("pai-a", fundador("avo-pa-a"), fundador("avo-ma-a")),
      no("mae-a", fundador("avo-pm-a"), fundador("avo-mm-a")),
    );
    const b = no(
      "sem-parentesco-b",
      no("pai-b", fundador("avo-pa-b"), fundador("avo-ma-b")),
      no("mae-b", fundador("avo-pm-b"), fundador("avo-mm-b")),
    );

    expect(calcularCoeficienteParentesco(a, b)).toBe(0);
  });

  it("ancestrais completamente desconhecidos (fundadores em ambos os lados) → 0%", () => {
    const a = fundador("fundador-a");
    const b = fundador("fundador-b");

    expect(calcularCoeficienteParentesco(a, b)).toBe(0);
  });

  it("mesma ave comparada consigo mesma retorna o coeficiente de autoparentesco (não é um caso de uso real, mas não deve quebrar)", () => {
    const pai = fundador("pai-x");
    const mae = fundador("mae-x");
    const ave = no("ave-x", pai, mae);

    // f(X,X) = 0.5*(1+f(pai,mae)); pai e mae fundadores não-aparentados → f(pai,mae)=0 → 0.5*1 = 50%.
    expect(calcularCoeficienteParentesco(ave, ave)).toBeCloseTo(50);
  });

  describe("caso não coberto explicitamente pela tabela da Task (documentado conforme instruído)", () => {
    it("apenas um avô em comum entre primos (pais são meio-irmãos, não irmãos completos) → 3,125%", () => {
      // Este caso não está na tabela de validação da Task 3.2 (que cobre apenas o caso
      // em que os primos compartilham AMBOS os avós, via pais que são irmãos completos).
      // Aqui os pais de A e B são meio-irmãos (compartilham só um avô), então o
      // algoritmo geral produz metade do valor do caso "primos de primeiro grau"
      // completo (6,25% / 2 = 3,125%), o que é o resultado correto segundo o método
      // padrão de kinship coefficient, mesmo não estando na tabela fornecida.
      const avoComum = fundador("avo-comum-unico");
      const paiDeA = no("pai-de-a-meio", avoComum, fundador("avo-nao-comum-1"));
      const paiDeB = no("pai-de-b-meio", avoComum, fundador("avo-nao-comum-2"));
      const a = no("primo-meio-a", paiDeA, fundador("mae-de-a-meio"));
      const b = no("primo-meio-b", paiDeB, fundador("mae-de-b-meio"));

      expect(calcularCoeficienteParentesco(a, b)).toBeCloseTo(3.125);
    });
  });
});
