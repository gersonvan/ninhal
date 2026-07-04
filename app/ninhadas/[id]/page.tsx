import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { runWithTenant } from "@/lib/tenant/context";
import { getNinhada, listFilhotesGerados } from "@/lib/ninhadas/service";
import { alertasConsanguinidadeAtivados } from "@/lib/tenant/preferences";
import AppShell from "@/components/nav/AppShell";
import FichaNinhada from "./FichaNinhada";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FichaNinhadaPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const tenant = await prisma.tenant.findUnique({ where: { ownerId: user.id } });
  if (!tenant) {
    redirect("/onboarding");
  }

  const { id } = await params;

  const [ninhada, alertasAtivados] = await Promise.all([
    runWithTenant(tenant.id, () => getNinhada(id)),
    alertasConsanguinidadeAtivados(tenant.id),
  ]);

  if (!ninhada) {
    notFound();
  }

  const filhotes = await runWithTenant(tenant.id, () =>
    listFilhotesGerados(ninhada.anilhaMachoId, ninhada.anilhaFemeaId),
  );

  return (
    <AppShell tenantName={tenant.name ?? "Ninhal"}>
      <FichaNinhada
        ninhada={ninhada}
        filhotes={filhotes}
        alertasAtivados={alertasAtivados}
      />
    </AppShell>
  );
}
