import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { runWithTenant } from "@/lib/tenant/context";
import { createAve } from "./service";
import { listAves } from "./service";

describe("listAves", () => {
  const suffix = randomUUID();
  let tenant: { id: string };
  let outroTenant: { id: string };
  let especieCanario: { id: string };
  let especieCalopsita: { id: string };

  beforeAll(async () => {
    tenant = await prisma.tenant.create({
      data: { ownerId: `test-owner-list-${suffix}`, name: "Tenant de teste" },
    });
    outroTenant = await prisma.tenant.create({
      data: { ownerId: `test-owner-list-outro-${suffix}`, name: "Outro tenant" },
    });
    especieCanario = await prisma.especie.create({
      data: { nome: `Canário lista ${suffix}` },
    });
    especieCalopsita = await prisma.especie.create({
      data: { nome: `Calopsita lista ${suffix}` },
    });

    await runWithTenant(tenant.id, () =>
      createAve({
        anilha: `BR-LISTA-AMALIA-${suffix}`,
        nomeApelido: "Amália",
        especieId: especieCanario.id,
        sexo: "FEMEA",
        origem: "NASCIDA_NO_CRIATORIO",
        status: "ATIVO",
      }),
    );
    await runWithTenant(tenant.id, () =>
      createAve({
        anilha: `BR-LISTA-RUFUS-${suffix}`,
        nomeApelido: "Rufus",
        especieId: especieCanario.id,
        sexo: "MACHO",
        origem: "ADQUIRIDA",
        status: "RESERVADO",
      }),
    );
    await runWithTenant(tenant.id, () =>
      createAve({
        anilha: `BR-LISTA-THEO-${suffix}`,
        nomeApelido: "Theo",
        especieId: especieCalopsita.id,
        sexo: "MACHO",
        origem: "ADQUIRIDA",
        status: "ATIVO",
      }),
    );
    // Ave de outro tenant, não deve aparecer em nenhuma consulta do tenant principal.
    await runWithTenant(outroTenant.id, () =>
      createAve({
        anilha: `BR-LISTA-OUTRO-${suffix}`,
        nomeApelido: "Intruso",
        especieId: especieCanario.id,
        sexo: "MACHO",
        origem: "ADQUIRIDA",
        status: "ATIVO",
      }),
    );
  });

  afterAll(async () => {
    await runWithTenant(tenant.id, async () => {
      await prisma.ave.deleteMany({});
    });
    await runWithTenant(outroTenant.id, async () => {
      await prisma.ave.deleteMany({});
    });
    await prisma.tenant.deleteMany({
      where: { id: { in: [tenant.id, outroTenant.id] } },
    });
    await prisma.especie.deleteMany({
      where: { id: { in: [especieCanario.id, especieCalopsita.id] } },
    });
  });

  it("lista apenas as aves do tenant do contexto atual", async () => {
    const aves = await runWithTenant(tenant.id, () => listAves());
    expect(aves).toHaveLength(3);
    expect(aves.some((ave) => ave.nomeApelido === "Intruso")).toBe(false);
  });

  it("busca por nome/apelido (case-insensitive)", async () => {
    const aves = await runWithTenant(tenant.id, () => listAves({ busca: "amál" }));
    expect(aves.map((a) => a.nomeApelido)).toEqual(["Amália"]);
  });

  it("busca por anilha", async () => {
    const aves = await runWithTenant(tenant.id, () =>
      listAves({ busca: `BR-LISTA-RUFUS-${suffix}` }),
    );
    expect(aves.map((a) => a.nomeApelido)).toEqual(["Rufus"]);
  });

  it("filtra por espécie", async () => {
    const aves = await runWithTenant(tenant.id, () =>
      listAves({ especieId: especieCalopsita.id }),
    );
    expect(aves.map((a) => a.nomeApelido)).toEqual(["Theo"]);
  });

  it("filtra por status", async () => {
    const aves = await runWithTenant(tenant.id, () => listAves({ status: "RESERVADO" }));
    expect(aves.map((a) => a.nomeApelido)).toEqual(["Rufus"]);
  });

  it("filtra por sexo", async () => {
    const aves = await runWithTenant(tenant.id, () => listAves({ sexo: "FEMEA" }));
    expect(aves.map((a) => a.nomeApelido)).toEqual(["Amália"]);
  });

  it("combina múltiplos filtros", async () => {
    const aves = await runWithTenant(tenant.id, () =>
      listAves({ especieId: especieCanario.id, sexo: "MACHO" }),
    );
    expect(aves.map((a) => a.nomeApelido)).toEqual(["Rufus"]);
  });
});
