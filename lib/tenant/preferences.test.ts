import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  alertasConsanguinidadeAtivados,
  atualizarAlertasConsanguinidade,
} from "./preferences";

/**
 * Testes de integração contra o banco Postgres real (Supabase), confirmando
 * que a escrita da preferência (Task 5.1) é persistida e refletida pela
 * leitura já usada pelas telas de Ninhadas/Árvore e pelo endpoint de
 * parentesco (Task 3.2).
 */
describe("atualizarAlertasConsanguinidade", () => {
  const suffix = randomUUID();
  let tenant: { id: string };

  beforeAll(async () => {
    tenant = await prisma.tenant.create({
      data: { ownerId: `test-owner-preferences-${suffix}`, name: "Tenant de teste" },
    });
  });

  afterAll(async () => {
    await prisma.tenant.delete({ where: { id: tenant.id } });
  });

  it("persiste false e a leitura passa a refletir o novo valor", async () => {
    await atualizarAlertasConsanguinidade(tenant.id, false);
    await expect(alertasConsanguinidadeAtivados(tenant.id)).resolves.toBe(false);
  });

  it("persiste true novamente e a leitura reflete a mudança", async () => {
    await atualizarAlertasConsanguinidade(tenant.id, true);
    await expect(alertasConsanguinidadeAtivados(tenant.id)).resolves.toBe(true);
  });
});
