import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export type TenantContext = { tenantId: string } | { response: NextResponse };

/** Resolve o tenant do usuário autenticado da requisição atual, ou uma resposta de erro pronta para retornar. */
export async function requireTenantId(): Promise<TenantContext> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      response: NextResponse.json({ error: "Não autenticado." }, { status: 401 }),
    };
  }

  const tenant = await prisma.tenant.findUnique({ where: { ownerId: user.id } });
  if (!tenant) {
    return {
      response: NextResponse.json(
        { error: "Onboarding não concluído para este usuário." },
        { status: 403 },
      ),
    };
  }

  return { tenantId: tenant.id };
}
