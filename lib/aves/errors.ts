export class AnilhaDuplicadaError extends Error {
  constructor() {
    super("Já existe uma ave com essa anilha para este criatório.");
    this.name = "AnilhaDuplicadaError";
  }
}

export class RegistroNaoEncontradoError extends Error {
  constructor(entidade: string) {
    super(`${entidade} não encontrada.`);
    this.name = "RegistroNaoEncontradoError";
  }
}
