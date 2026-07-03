import { randomUUID } from "node:crypto";
import { ZodError } from "zod";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { runWithTenant } from "@/lib/tenant/context";
import { ParentescoInvalidoError } from "./compatibility";
import { AnilhaDuplicadaError } from "./errors";
import { createAve } from "./service";

/**
 * Testes de integração contra o banco Postgres real (Supabase), exercitando as
 * regras de acesso e de negócio ponta a ponta: isolamento por tenant do middleware
 * do Prisma, unicidade de anilha por tenant, e compatibilidade de parentesco.
 */
describe("createAve", () => {
  const suffix = randomUUID();
  let tenantA: { id: string };
  let tenantB: { id: string };
  let especieCanario: { id: string };
  let especieCalopsita: { id: string };

  beforeAll(async () => {
    tenantA = await prisma.tenant.create({
      data: { ownerId: `test-owner-a-${suffix}`, name: "Tenant A de teste" },
    });
    tenantB = await prisma.tenant.create({
      data: { ownerId: `test-owner-b-${suffix}`, name: "Tenant B de teste" },
    });
    especieCanario = await prisma.especie.create({
      data: { nome: `Canário de teste ${suffix}` },
    });
    especieCalopsita = await prisma.especie.create({
      data: { nome: `Calopsita de teste ${suffix}` },
    });
  });

  afterAll(async () => {
    await runWithTenant(tenantA.id, async () => {
      await prisma.ave.deleteMany({});
    });
    await runWithTenant(tenantB.id, async () => {
      await prisma.ave.deleteMany({});
    });
    await prisma.tenant.deleteMany({
      where: { id: { in: [tenantA.id, tenantB.id] } },
    });
    await prisma.especie.deleteMany({
      where: { id: { in: [especieCanario.id, especieCalopsita.id] } },
    });
  });

  it("cria uma ave associada ao tenant do contexto atual", async () => {
    const ave = await runWithTenant(tenantA.id, () =>
      createAve({
        anilha: `BR-CRIA-${suffix}`,
        especieId: especieCanario.id,
        sexo: "FEMEA",
        origem: "NASCIDA_NO_CRIATORIO",
      }),
    );
    expect(ave.tenantId).toBe(tenantA.id);
  });

  it("permite a mesma anilha em tenants diferentes", async () => {
    const anilha = `BR-DUP-TENANT-${suffix}`;
    await runWithTenant(tenantA.id, () =>
      createAve({
        anilha,
        especieId: especieCanario.id,
        sexo: "MACHO",
        origem: "ADQUIRIDA",
      }),
    );

    await expect(
      runWithTenant(tenantB.id, () =>
        createAve({
          anilha,
          especieId: especieCanario.id,
          sexo: "MACHO",
          origem: "ADQUIRIDA",
        }),
      ),
    ).resolves.toBeDefined();
  });

  it("bloqueia anilha duplicada dentro do mesmo tenant", async () => {
    const anilha = `BR-DUP-MESMO-${suffix}`;
    await runWithTenant(tenantA.id, () =>
      createAve({
        anilha,
        especieId: especieCanario.id,
        sexo: "MACHO",
        origem: "ADQUIRIDA",
      }),
    );

    await expect(
      runWithTenant(tenantA.id, () =>
        createAve({
          anilha,
          especieId: especieCanario.id,
          sexo: "FEMEA",
          origem: "ADQUIRIDA",
        }),
      ),
    ).rejects.toThrow(AnilhaDuplicadaError);
  });

  it("bloqueia a criação sem os campos obrigatórios", async () => {
    await expect(
      runWithTenant(tenantA.id, () =>
        createAve({ anilha: `BR-SEM-CAMPOS-${suffix}`, especieId: especieCanario.id }),
      ),
    ).rejects.toThrow(ZodError);
  });

  it("bloqueia pai de espécie diferente da ave", async () => {
    const pai = await runWithTenant(tenantA.id, () =>
      createAve({
        anilha: `BR-PAI-ESPECIE-ERRADA-${suffix}`,
        especieId: especieCalopsita.id,
        sexo: "MACHO",
        origem: "ADQUIRIDA",
      }),
    );

    await expect(
      runWithTenant(tenantA.id, () =>
        createAve({
          anilha: `BR-FILHO-ESPECIE-${suffix}`,
          especieId: especieCanario.id,
          sexo: "MACHO",
          origem: "NASCIDA_NO_CRIATORIO",
          anilhaPaiId: pai.id,
        }),
      ),
    ).rejects.toThrow(ParentescoInvalidoError);
  });

  it("bloqueia referência a pai que não seja do sexo Macho", async () => {
    const mae = await runWithTenant(tenantA.id, () =>
      createAve({
        anilha: `BR-MAE-COMO-PAI-${suffix}`,
        especieId: especieCanario.id,
        sexo: "FEMEA",
        origem: "ADQUIRIDA",
      }),
    );

    await expect(
      runWithTenant(tenantA.id, () =>
        createAve({
          anilha: `BR-FILHO-SEXO-PAI-${suffix}`,
          especieId: especieCanario.id,
          sexo: "FEMEA",
          origem: "NASCIDA_NO_CRIATORIO",
          anilhaPaiId: mae.id,
        }),
      ),
    ).rejects.toThrow(ParentescoInvalidoError);
  });

  it("cria uma ave com pai e mãe compatíveis", async () => {
    const pai = await runWithTenant(tenantA.id, () =>
      createAve({
        anilha: `BR-PAI-OK-${suffix}`,
        especieId: especieCanario.id,
        sexo: "MACHO",
        origem: "ADQUIRIDA",
      }),
    );
    const mae = await runWithTenant(tenantA.id, () =>
      createAve({
        anilha: `BR-MAE-OK-${suffix}`,
        especieId: especieCanario.id,
        sexo: "FEMEA",
        origem: "ADQUIRIDA",
      }),
    );

    const filho = await runWithTenant(tenantA.id, () =>
      createAve({
        anilha: `BR-FILHO-OK-${suffix}`,
        especieId: especieCanario.id,
        sexo: "NAO_SEXADO",
        origem: "NASCIDA_NO_CRIATORIO",
        anilhaPaiId: pai.id,
        anilhaMaeId: mae.id,
      }),
    );

    expect(filho.anilhaPaiId).toBe(pai.id);
    expect(filho.anilhaMaeId).toBe(mae.id);
  });
});
