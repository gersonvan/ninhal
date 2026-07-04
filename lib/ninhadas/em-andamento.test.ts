import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { runWithTenant } from "@/lib/tenant/context";
import { createAve } from "@/lib/aves/service";
import {
  aveEstaEmNinhadaAndamento,
  createNinhada,
  listAveIdsEmNinhadaAndamento,
  updateNinhada,
} from "./service";

describe("indicador de ave em ninhada em andamento", () => {
  const suffix = randomUUID();
  let tenant: { id: string };
  let especie: { id: string };

  beforeAll(async () => {
    tenant = await prisma.tenant.create({
      data: { ownerId: `test-owner-em-andamento-${suffix}`, name: "Tenant" },
    });
    especie = await prisma.especie.create({
      data: { nome: `Espécie em-andamento ${suffix}` },
    });
  });

  afterAll(async () => {
    await runWithTenant(tenant.id, async () => {
      await prisma.ninhada.deleteMany({});
      await prisma.ave.deleteMany({});
    });
    await prisma.tenant.delete({ where: { id: tenant.id } });
    await prisma.especie.delete({ where: { id: especie.id } });
  });

  async function criarCasalAtivo(sufixoAnilha: string) {
    const macho = await runWithTenant(tenant.id, () =>
      createAve({
        anilha: `BR-ANDAMENTO-M-${sufixoAnilha}`,
        especieId: especie.id,
        sexo: "MACHO",
        origem: "ADQUIRIDA",
        status: "ATIVO",
      }),
    );
    const femea = await runWithTenant(tenant.id, () =>
      createAve({
        anilha: `BR-ANDAMENTO-F-${sufixoAnilha}`,
        especieId: especie.id,
        sexo: "FEMEA",
        origem: "ADQUIRIDA",
        status: "ATIVO",
      }),
    );
    return { macho, femea };
  }

  it("indica que o casal está em uma ninhada em andamento (filhotesNascidos nulo)", async () => {
    const { macho, femea } = await criarCasalAtivo(`CURSO-${suffix}`);
    await runWithTenant(tenant.id, () =>
      createNinhada({
        anilhaMachoId: macho.id,
        anilhaFemeaId: femea.id,
        dataPostura: "2026-01-01",
      }),
    );

    const machoEmAndamento = await runWithTenant(tenant.id, () =>
      aveEstaEmNinhadaAndamento(macho.id),
    );
    const femeaEmAndamento = await runWithTenant(tenant.id, () =>
      aveEstaEmNinhadaAndamento(femea.id),
    );

    expect(machoEmAndamento).toBe(true);
    expect(femeaEmAndamento).toBe(true);
  });

  it("não indica ave em ninhada já encerrada (filhotesNascidos preenchido)", async () => {
    const { macho, femea } = await criarCasalAtivo(`ENCERRADA-${suffix}`);
    const ninhada = await runWithTenant(tenant.id, () =>
      createNinhada({
        anilhaMachoId: macho.id,
        anilhaFemeaId: femea.id,
        dataPostura: "2026-01-01",
      }),
    );
    await runWithTenant(tenant.id, () =>
      updateNinhada(ninhada.id, { filhotesNascidos: 3 }),
    );

    const emAndamento = await runWithTenant(tenant.id, () =>
      aveEstaEmNinhadaAndamento(macho.id),
    );
    expect(emAndamento).toBe(false);
  });

  it("não altera o campo status armazenado da ave", async () => {
    const { macho, femea } = await criarCasalAtivo(`STATUS-INTACTO-${suffix}`);
    await runWithTenant(tenant.id, () =>
      createNinhada({
        anilhaMachoId: macho.id,
        anilhaFemeaId: femea.id,
        dataPostura: "2026-01-01",
      }),
    );

    await runWithTenant(tenant.id, () => aveEstaEmNinhadaAndamento(macho.id));

    const machoRecarregado = await runWithTenant(tenant.id, async () => {
      return await prisma.ave.findUnique({ where: { id: macho.id } });
    });
    expect(machoRecarregado?.status).toBe("ATIVO");
  });

  it("verifica múltiplas aves de uma vez, retornando apenas as que estão em andamento", async () => {
    const { macho, femea } = await criarCasalAtivo(`LOTE-${suffix}`);
    const foraDaNinhada = await runWithTenant(tenant.id, () =>
      createAve({
        anilha: `BR-ANDAMENTO-FORA-${suffix}`,
        especieId: especie.id,
        sexo: "MACHO",
        origem: "ADQUIRIDA",
      }),
    );
    await runWithTenant(tenant.id, () =>
      createNinhada({
        anilhaMachoId: macho.id,
        anilhaFemeaId: femea.id,
        dataPostura: "2026-01-01",
      }),
    );

    const resultado = await runWithTenant(tenant.id, () =>
      listAveIdsEmNinhadaAndamento([macho.id, femea.id, foraDaNinhada.id]),
    );

    expect(resultado.has(macho.id)).toBe(true);
    expect(resultado.has(femea.id)).toBe(true);
    expect(resultado.has(foraDaNinhada.id)).toBe(false);
  });
});
