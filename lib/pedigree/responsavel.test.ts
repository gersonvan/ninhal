import { describe, expect, it } from "vitest";
import { resolverNomeResponsavel } from "./responsavel";

describe("resolverNomeResponsavel", () => {
  it("usa o nome completo persistido em user_metadata quando presente", () => {
    const nome = resolverNomeResponsavel({
      email: "carlos@aviario.com.br",
      user_metadata: { full_name: "Carlos Menezes" },
    });

    expect(nome).toBe("Carlos Menezes");
  });

  it("usa o e-mail como alternativa quando não há nome persistido (conta anterior à Task 4.5)", () => {
    const nome = resolverNomeResponsavel({
      email: "carlos@aviario.com.br",
      user_metadata: {},
    });

    expect(nome).toBe("carlos@aviario.com.br");
  });

  it("usa o e-mail como alternativa quando full_name é uma string vazia/em branco", () => {
    const nome = resolverNomeResponsavel({
      email: "carlos@aviario.com.br",
      user_metadata: { full_name: "   " },
    });

    expect(nome).toBe("carlos@aviario.com.br");
  });

  it("retorna rótulo genérico quando não há nome nem e-mail", () => {
    const nome = resolverNomeResponsavel({
      email: undefined,
      user_metadata: {},
    });

    expect(nome).toBe("Responsável não identificado");
  });
});
