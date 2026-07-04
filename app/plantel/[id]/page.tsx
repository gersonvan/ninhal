import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { runWithTenant } from "@/lib/tenant/context";
import { getAve } from "@/lib/aves/service";
import { aveEstaEmNinhadaAndamento } from "@/lib/ninhadas/service";
import AppShell from "@/components/nav/AppShell";
import FichaAve from "./FichaAve";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FichaAvePage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const tenant = await prisma.tenant.findUnique({ where: { ownerId: user.id } });
  if (!tenant) {
    redirect("/onboarding");
  }

  const { id } = await params;
  const ave = await runWithTenant(tenant.id, () => getAve(id));
  if (!ave) {
    notFound();
  }

  const [especies, emNinhada] = await Promise.all([
    prisma.especie.findMany({ orderBy: { nome: "asc" } }),
    runWithTenant(tenant.id, () => aveEstaEmNinhadaAndamento(id)),
  ]);

  return (
    <AppShell tenantName={tenant.name ?? "Ninhal"}>
      <FichaAve ave={ave} especies={especies} emNinhada={emNinhada} />
    </AppShell>
  );
}
