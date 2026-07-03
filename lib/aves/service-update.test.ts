import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { runWithTenant } from "@/lib/tenant/context";
import { createAve, getAve, updateAve } from "./service";
import { RegistroNaoEncontradoError } from "./errors";

describe("updateAve", () => {
  const suffix = randomUUID();
  let tenant: { id: string };
  let especie: { id: string };

  beforeAll(async () => {
    tenant = await prisma.tenant.create({
      data: { ownerId: `test-owner-update-${suffix}`, name: "Tenant de teste" },
    });
    especie = await prisma.especie.create({
      data: { nome: `Espécie update ${suffix}` },
    });
  });

  afterAll(async () => {
    await runWithTenant(tenant.id, async () => {
      await prisma.ave.deleteMany({});
    });
    await prisma.tenant.delete({ where: { id: tenant.id } });
    await prisma.especie.delete({ where: { id: especie.id } });
  });

  it("altera o status de uma ave existente", async () => {
    const ave = await runWithTenant(tenant.id, () =>
      createAve({
        anilha: `BR-UPDATE-STATUS-${suffix}`,
        especieId: especie.id,
        sexo: "FEMEA",
        origem: "NASCIDA_NO_CRIATORIO",
      }),
    );
    expect(ave.status).toBe("ATIVO");

    const atualizada = await runWithTenant(tenant.id, () =>
      updateAve(ave.id, { status: "RESERVADO" }),
    );
    expect(atualizada.status).toBe("RESERVADO");

    const recarregada = await runWithTenant(tenant.id, () => getAve(ave.id));
    expect(recarregada?.status).toBe("RESERVADO");
  });

  it("atualiza campos simples sem afetar os demais", async () => {
    const ave = await runWithTenant(tenant.id, () =>
      createAve({
        anilha: `BR-UPDATE-CAMPO-${suffix}`,
        nomeApelido: "Nome original",
        especieId: especie.id,
        sexo: "MACHO",
        origem: "ADQUIRIDA",
      }),
    );

    const atualizada = await runWithTenant(tenant.id, () =>
      updateAve(ave.id, { mutacaoCor: "Isabela" }),
    );

    expect(atualizada.nomeApelido).toBe("Nome original");
    expect(atualizada.mutacaoCor).toBe("Isabela");
  });

  it("bloqueia atualização de uma ave inexistente", async () => {
    await expect(
      runWithTenant(tenant.id, () =>
        updateAve("00000000-0000-0000-0000-000000000000", { status: "VENDIDO" }),
      ),
    ).rejects.toThrow(RegistroNaoEncontradoError);
  });
});
