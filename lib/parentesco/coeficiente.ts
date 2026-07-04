/**
 * Cálculo do coeficiente de parentesco (kinship coefficient) entre dois indivíduos,
 * usando o método recursivo padrão de genética de populações: f(X,X) = 0.5*(1+f(pai,mae)),
 * e f(X,Y) = 0.5*(f(X,pai(Y)) + f(X,mae(Y))) para X≠Y, expandindo o lado com
 * ancestrais conhecidos. Ancestrais desconhecidos (fora das gerações rastreadas, ou
 * não cadastrados) são tratados como fundadores não-aparentados entre si (kinship 0).
 *
 * O valor retornado por calcularCoeficienteParentesco também corresponde ao
 * coeficiente de consanguinidade esperado de um eventual filhote do casal (X,Y).
 *
 * Uma soma ingênua sobre "ancestrais em comum" (contando cada ID compartilhado
 * independentemente da profundidade) SUPERESTIMA o parentesco quando os pais já são
 * compartilhados (os avós, também compartilhados por consequência, seriam contados de
 * novo). O método recursivo evita esse problema porque expande apenas um lado por vez
 * e para a recursão assim que encontra o indivíduo em comum (caso base X.id === Y.id).
 */

export interface NoParentesco {
  id: string;
  pai: NoParentesco | null;
  mae: NoParentesco | null;
}

export function calcularKinship(
  x: NoParentesco | null,
  y: NoParentesco | null,
): number {
  if (!x || !y) return 0;

  if (x.id === y.id) {
    return 0.5 * (1 + calcularKinship(x.pai, x.mae));
  }

  if (y.pai || y.mae) {
    return 0.5 * (calcularKinship(x, y.pai) + calcularKinship(x, y.mae));
  }

  if (x.pai || x.mae) {
    return 0.5 * (calcularKinship(x.pai, y) + calcularKinship(x.mae, y));
  }

  return 0;
}

/** Coeficiente de parentesco entre duas aves, como percentual (0-100). */
export function calcularCoeficienteParentesco(
  aveA: NoParentesco,
  aveB: NoParentesco,
): number {
  return calcularKinship(aveA, aveB) * 100;
}
