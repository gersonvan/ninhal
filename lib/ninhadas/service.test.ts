import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { runWithTenant } from "@/lib/tenant/context";
import { createAve } from "@/lib/aves/service";
import { ParentescoInvalidoError } from "@/lib/aves/compatibility";
import { createNinhada } from "./service";
import { CodNinhadaDuplicadoError } from "./errors";

describe("createNinhada", () => {
  const suffix = randomUUID();
  let tenantA: { id: string };
  let tenantB: { id: string };
  let especie: { id: string };

  beforeAll(async () => {
    tenantA = await prisma.tenant.create({
      data: { ownerId: `test-owner-ninhada-a-${suffix}`, name: "Tenant A" },
    });
    tenantB = await prisma.tenant.create({
      data: { ownerId: `test-owner-ninhada-b-${suffix}`, name: "Tenant B" },
    });
    especie = await prisma.especie.create({
      data: { nome: `Espécie ninhada ${suffix}` },
    });
  });

  afterAll(async () => {
    await runWithTenant(tenantA.id, async () => {
      await prisma.ninhada.deleteMany({});
      await prisma.ave.deleteMany({});
    });
    await runWithTenant(tenantB.id, async () => {
      await prisma.ninhada.deleteMany({});
      await prisma.ave.deleteMany({});
    });
    await prisma.tenant.deleteMany({ where: { id: { in: [tenantA.id, tenantB.id] } } });
    await prisma.especie.delete({ where: { id: especie.id } });
  });

  async function criarCasalAtivo(tenantId: string, sufixoAnilha: string) {
    const macho = await runWithTenant(tenantId, () =>
      createAve({
        anilha: `BR-NINHADA-M-${sufixoAnilha}`,
        especieId: especie.id,
        sexo: "MACHO",
        origem: "ADQUIRIDA",
        status: "ATIVO",
      }),
    );
    const femea = await runWithTenant(tenantId, () =>
      createAve({
        anilha: `BR-NINHADA-F-${sufixoAnilha}`,
        especieId: especie.id,
        sexo: "FEMEA",
        origem: "ADQUIRIDA",
        status: "ATIVO",
      }),
    );
    return { macho, femea };
  }

  it("gera codNinhada sequencial por tenant/ano", async () => {
    const { macho, femea } = await criarCasalAtivo(tenantA.id, `SEQ-${suffix}`);

    const primeira = await runWithTenant(tenantA.id, () =>
      createNinhada({
        anilhaMachoId: macho.id,
        anilhaFemeaId: femea.id,
        dataPostura: "2026-01-10",
      }),
    );
    const segunda = await runWithTenant(tenantA.id, () =>
      createNinhada({
        anilhaMachoId: macho.id,
        anilhaFemeaId: femea.id,
        dataPostura: "2026-03-01",
      }),
    );

    expect(primeira.codNinhada).toBe("2026-01");
    expect(segunda.codNinhada).toBe("2026-02");
  });

  it("reinicia a sequência na virada do ano", async () => {
    const { macho, femea } = await criarCasalAtivo(tenantA.id, `VIRADA-${suffix}`);

    await runWithTenant(tenantA.id, () =>
      createNinhada({
        anilhaMachoId: macho.id,
        anilhaFemeaId: femea.id,
        dataPostura: "2099-11-01",
      }),
    );
    const proximoAno = await runWithTenant(tenantA.id, () =>
      createNinhada({
        anilhaMachoId: macho.id,
        anilhaFemeaId: femea.id,
        dataPostura: "2100-01-15",
      }),
    );

    expect(proximoAno.codNinhada).toBe("2100-01");
  });

  it("conta a sequência de forma isolada por tenant", async () => {
    const casalA = await criarCasalAtivo(tenantA.id, `ISOLADO-A-${suffix}`);
    const casalB = await criarCasalAtivo(tenantB.id, `ISOLADO-B-${suffix}`);

    await runWithTenant(tenantA.id, () =>
      createNinhada({
        anilhaMachoId: casalA.macho.id,
        anilhaFemeaId: casalA.femea.id,
        dataPostura: "2050-05-01",
      }),
    );
    const ninhadaB = await runWithTenant(tenantB.id, () =>
      createNinhada({
        anilhaMachoId: casalB.macho.id,
        anilhaFemeaId: casalB.femea.id,
        dataPostura: "2050-05-01",
      }),
    );

    expect(ninhadaB.codNinhada).toBe("2050-01");
  });

  it("bloqueia código de ninhada explícito duplicado no mesmo tenant", async () => {
    const { macho, femea } = await criarCasalAtivo(tenantA.id, `DUP-${suffix}`);

    await runWithTenant(tenantA.id, () =>
      createNinhada({
        codNinhada: `CUSTOM-${suffix}`,
        anilhaMachoId: macho.id,
        anilhaFemeaId: femea.id,
        dataPostura: "2030-01-01",
      }),
    );

    await expect(
      runWithTenant(tenantA.id, () =>
        createNinhada({
          codNinhada: `CUSTOM-${suffix}`,
          anilhaMachoId: macho.id,
          anilhaFemeaId: femea.id,
          dataPostura: "2030-02-01",
        }),
      ),
    ).rejects.toThrow(CodNinhadaDuplicadoError);
  });

  it("bloqueia o casal quando uma das aves não está com status Ativo", async () => {
    const macho = await runWithTenant(tenantA.id, () =>
      createAve({
        anilha: `BR-NINHADA-INATIVO-M-${suffix}`,
        especieId: especie.id,
        sexo: "MACHO",
        origem: "ADQUIRIDA",
        status: "RESERVADO",
      }),
    );
    const femea = await runWithTenant(tenantA.id, () =>
      createAve({
        anilha: `BR-NINHADA-INATIVO-F-${suffix}`,
        especieId: especie.id,
        sexo: "FEMEA",
        origem: "ADQUIRIDA",
        status: "ATIVO",
      }),
    );

    await expect(
      runWithTenant(tenantA.id, () =>
        createNinhada({
          anilhaMachoId: macho.id,
          anilhaFemeaId: femea.id,
          dataPostura: "2026-01-01",
        }),
      ),
    ).rejects.toThrow(ParentescoInvalidoError);
  });

  it("calcula taxaEclosao na criação quando os campos são informados", async () => {
    const { macho, femea } = await criarCasalAtivo(tenantA.id, `TAXA-${suffix}`);

    const ninhada = await runWithTenant(tenantA.id, () =>
      createNinhada({
        anilhaMachoId: macho.id,
        anilhaFemeaId: femea.id,
        dataPostura: "2026-01-01",
        ovosBotados: 8,
        filhotesNascidos: 6,
      }),
    );

    expect(ninhada.taxaEclosao).toBe(75);
  });
});
