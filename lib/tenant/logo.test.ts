import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { uploadLogo } from "./logo";

function criarSupabaseMock(options: {
  uploadError?: { message: string };
  publicUrl?: string;
}) {
  const upload = vi.fn().mockResolvedValue({ error: options.uploadError ?? null });
  const getPublicUrl = vi
    .fn()
    .mockReturnValue({ data: { publicUrl: options.publicUrl ?? "" } });
  const from = vi.fn().mockReturnValue({ upload, getPublicUrl });
  const mock = { storage: { from } };
  return { mock, client: mock as unknown as SupabaseClient };
}

function arquivoDe(nome: string): File {
  return new File(["conteudo"], nome, { type: "image/png" });
}

describe("uploadLogo", () => {
  it("envia o arquivo para o bucket correto e retorna a URL pública", async () => {
    const { mock, client } = criarSupabaseMock({
      publicUrl: "https://storage.exemplo/logos/abc/logo-1.png",
    });

    const url = await uploadLogo(client, "user-abc", arquivoDe("logo.png"));

    expect(mock.storage.from).toHaveBeenCalledWith("logos");
    expect(url).toBe("https://storage.exemplo/logos/abc/logo-1.png");
  });

  it("usa o id do usuário como prefixo do caminho no storage", async () => {
    const { mock, client } = criarSupabaseMock({
      publicUrl: "https://storage.exemplo/x.png",
    });

    await uploadLogo(client, "user-abc", arquivoDe("logo.png"));

    const uploadMock = mock.storage.from("logos").upload;
    const [path] = uploadMock.mock.calls[0];
    expect(path).toMatch(/^user-abc\/logo-\d+\.png$/);
  });

  it("retorna null quando o upload falha", async () => {
    const { client } = criarSupabaseMock({ uploadError: { message: "falhou" } });

    const url = await uploadLogo(client, "user-abc", arquivoDe("logo.png"));

    expect(url).toBeNull();
  });
});
