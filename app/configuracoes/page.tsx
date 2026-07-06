import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { alertasConsanguinidadeAtivados } from "@/lib/tenant/preferences";
import { listarEspecies } from "@/lib/especies/service";
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

  const [alertasAtivadosInicial, especies] = await Promise.all([
    alertasConsanguinidadeAtivados(tenant.id),
    listarEspecies(),
  ]);

  return (
    <AppShell tenantName={tenant.name ?? "Ninhal"}>
      <ConfiguracoesView
        user={user}
        tenant={tenant}
        alertasAtivadosInicial={alertasAtivadosInicial}
        especiesIniciais={especies}
      />
    </AppShell>
  );
}
