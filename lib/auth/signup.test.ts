import { describe, expect, it } from "vitest";
import { buildSignUpPayload } from "./signup";

function formDataDe(campos: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [chave, valor] of Object.entries(campos)) {
    formData.set(chave, valor);
  }
  return formData;
}

describe("buildSignUpPayload", () => {
  it("persiste o nome completo do cadastro em options.data.full_name", () => {
    const payload = buildSignUpPayload(
      formDataDe({
        name: "Carlos Menezes",
        email: "carlos@aviario.com.br",
        password: "senha123",
      }),
    );

    expect(payload).toEqual({
      email: "carlos@aviario.com.br",
      password: "senha123",
      options: { data: { full_name: "Carlos Menezes" } },
    });
  });

  it("remove espaços em branco do nome antes de persistir", () => {
    const payload = buildSignUpPayload(
      formDataDe({
        name: "  Ana Souza  ",
        email: "ana@aviario.com.br",
        password: "senha123",
      }),
    );

    expect(payload.options.data.full_name).toBe("Ana Souza");
  });

  it("envia full_name vazio quando o campo nome não é enviado", () => {
    const payload = buildSignUpPayload(
      formDataDe({
        email: "sem-nome@aviario.com.br",
        password: "senha123",
      }),
    );

    expect(payload.options.data.full_name).toBe("");
  });
});
