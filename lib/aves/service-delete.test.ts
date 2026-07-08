import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { runWithTenant } from "@/lib/tenant/context";
import { createNinhada, deleteNinhada } from "@/lib/ninhadas/service";
import { createAve, deleteAve, getAve } from "./service";
import { AveComVinculosError, RegistroNaoEncontradoError } from "./errors";

describe("deleteAve / deleteNinhada", () => {
  const suffix = randomUUID();
  let tenantA: { id: string };
  let tenantB: { id: string };
  let especie: { id: string };

  beforeAll(async () => {
    tenantA = await prisma.tenant.create({
      data: { ownerId: `test-owner-delete-a-${suffix}`, name: "Tenant A" },
    });
    tenantB = await prisma.tenant.create({
      data: { ownerId: `test-owner-delete-b-${suffix}`, name: "Tenant B" },
    });
    especie = await prisma.especie.create({
      data: { nome: `Espécie delete ${suffix}` },
    });
  });

  afterAll(async () => {
    for (const tenant of [tenantA, tenantB]) {
      await runWithTenant(tenant.id, async () => {
        await prisma.ninhada.deleteMany({});
        await prisma.ave.updateMany({
          data: { anilhaPaiId: null, anilhaMaeId: null },
        });
        await prisma.ave.deleteMany({});
      });
    }
    await prisma.tenant.deleteMany({
      where: { id: { in: [tenantA.id, tenantB.id] } },
    });
    await prisma.especie.delete({ where: { id: especie.id } });
  });

  function novaAve(
    tenantId: string,
    anilha: string,
    sexo: "MACHO" | "FEMEA",
    parentes: { anilhaPaiId?: string; anilhaMaeId?: string } = {},
  ) {
    return runWithTenant(tenantId, () =>
      createAve({
        anilha,
        especieId: especie.id,
        sexo,
        origem: "ADQUIRIDA",
        status: "ATIVO",
        ...parentes,
      }),
    );
  }

  it("exclui uma ave sem vínculos", async () => {
    const ave = await novaAve(tenantA.id, `DEL-SOLO-${suffix}`, "MACHO");

    await runWithTenant(tenantA.id, () => deleteAve(ave.id));

    const aposExclusao = await runWithTenant(tenantA.id, () => getAve(ave.id));
    expect(aposExclusao).toBeNull();
  });

  it("bloqueia exclusão de ave que é pai de outra ave", async () => {
    const pai = await novaAve(tenantA.id, `DEL-PAI-${suffix}`, "MACHO");
    await novaAve(tenantA.id, `DEL-FILHO-${suffix}`, "MACHO", {
      anilhaPaiId: pai.id,
    });

    await expect(
      runWithTenant(tenantA.id, () => deleteAve(pai.id)),
    ).rejects.toBeInstanceOf(AveComVinculosError);
  });

  it("bloqueia exclusão de ave que participa de ninhada", async () => {
    const macho = await novaAve(tenantA.id, `DEL-NIN-M-${suffix}`, "MACHO");
    const femea = await novaAve(tenantA.id, `DEL-NIN-F-${suffix}`, "FEMEA");
    await runWithTenant(tenantA.id, () =>
      createNinhada({
        anilhaMachoId: macho.id,
        anilhaFemeaId: femea.id,
        dataPostura: "2026-07-01",
      }),
    );

    await expect(
      runWithTenant(tenantA.id, () => deleteAve(macho.id)),
    ).rejects.toBeInstanceOf(AveComVinculosError);
  });

  it("não exclui ave de outro tenant (isolamento)", async () => {
    const aveDeB = await novaAve(tenantB.id, `DEL-ISOLA-${suffix}`, "FEMEA");

    await expect(
      runWithTenant(tenantA.id, () => deleteAve(aveDeB.id)),
    ).rejects.toBeInstanceOf(RegistroNaoEncontradoError);

    const aindaExiste = await runWithTenant(tenantB.id, () =>
      getAve(aveDeB.id),
    );
    expect(aindaExiste).not.toBeNull();
  });

  it("exclui uma ninhada e libera a exclusão das aves do casal", async () => {
    const macho = await novaAve(tenantA.id, `DEL-LIB-M-${suffix}`, "MACHO");
    const femea = await novaAve(tenantA.id, `DEL-LIB-F-${suffix}`, "FEMEA");
    const ninhada = await runWithTenant(tenantA.id, () =>
      createNinhada({
        anilhaMachoId: macho.id,
        anilhaFemeaId: femea.id,
        dataPostura: "2026-07-01",
      }),
    );

    await runWithTenant(tenantA.id, () => deleteNinhada(ninhada.id));
    await runWithTenant(tenantA.id, () => deleteAve(macho.id));

    expect(await runWithTenant(tenantA.id, () => getAve(macho.id))).toBeNull();
  });

  it("não exclui ninhada de outro tenant (isolamento)", async () => {
    const macho = await novaAve(tenantB.id, `DEL-NB-M-${suffix}`, "MACHO");
    const femea = await novaAve(tenantB.id, `DEL-NB-F-${suffix}`, "FEMEA");
    const ninhada = await runWithTenant(tenantB.id, () =>
      createNinhada({
        anilhaMachoId: macho.id,
        anilhaFemeaId: femea.id,
        dataPostura: "2026-07-01",
      }),
    );

    await expect(
      runWithTenant(tenantA.id, () => deleteNinhada(ninhada.id)),
    ).rejects.toBeInstanceOf(RegistroNaoEncontradoError);
  });
});
