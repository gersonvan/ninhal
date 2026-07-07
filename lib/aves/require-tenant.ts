import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/**
 * Guarda de autenticação/onboarding reaproveitada por Server Actions que
 * operam sobre o plantel do tenant atual (cadastro de aves, importação do
 * IBAMA). Não é uma Server Action em si — por isso vive fora de um módulo
 * "use server", que só pode exportar funções assíncronas invocáveis
 * diretamente pelo cliente.
 */
export async function requireTenantOrRedirect() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const tenant = await prisma.tenant.findUnique({ where: { ownerId: user.id } });
  if (!tenant) {
    redirect("/onboarding");
  }

  return { supabase, tenant };
}
