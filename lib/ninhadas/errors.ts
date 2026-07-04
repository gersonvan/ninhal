export class CodNinhadaDuplicadoError extends Error {
  constructor() {
    super("Já existe uma ninhada com esse código para este criatório.");
    this.name = "CodNinhadaDuplicadoError";
  }
}
