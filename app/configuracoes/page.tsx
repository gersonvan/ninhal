import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { alertasConsanguinidadeAtivados } from "@/lib/tenant/preferences";
import AppShell from "@/components/nav/AppShell";
import ConfiguracoesView from "./ConfiguracoesView";

export default async function ConfiguracoesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const tenant = await prisma.tenant.findUnique({ where: { ownerId: user.id } });
  if (!tenant) {
    redirect("/onboarding");
  }

  const alertasAtivadosInicial = await alertasConsanguinidadeAtivados(tenant.id);

  return (
    <AppShell tenantName={tenant.name ?? "Ninhal"}>
      <ConfiguracoesView
        user={user}
        tenant={tenant}
        alertasAtivadosInicial={alertasAtivadosInicial}
      />
    </AppShell>
  );
}
