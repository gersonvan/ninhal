/**
 * Regras de compatibilidade de parentesco: o pai referenciado precisa ser da mesma
 * espécie e sexo Macho; a mãe referenciada precisa ser da mesma espécie e sexo Fêmea.
 * Mantidas como funções puras (sem dependência do Prisma Client) para serem testáveis
 * isoladamente, seguindo o mesmo padrão de lib/tenant/scope.ts.
 */

export class ParentescoInvalidoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParentescoInvalidoError";
  }
}

export interface AveParentesco {
  especieId: string;
  sexo: "MACHO" | "FEMEA" | "NAO_SEXADO";
}

export function assertPaiCompativel(pai: AveParentesco, especieId: string): void {
  if (pai.especieId !== especieId) {
    throw new ParentescoInvalidoError(
      "O pai informado precisa ser da mesma espécie da ave.",
    );
  }
  if (pai.sexo !== "MACHO") {
    throw new ParentescoInvalidoError(
      "O pai informado precisa ser do sexo Macho.",
    );
  }
}

export function assertMaeCompativel(mae: AveParentesco, especieId: string): void {
  if (mae.especieId !== especieId) {
    throw new ParentescoInvalidoError(
      "A mãe informada precisa ser da mesma espécie da ave.",
    );
  }
  if (mae.sexo !== "FEMEA") {
    throw new ParentescoInvalidoError(
      "A mãe informada precisa ser do sexo Fêmea.",
    );
  }
}
