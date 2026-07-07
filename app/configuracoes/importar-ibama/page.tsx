import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { listarEspecies } from "@/lib/especies/service";
import AppShell from "@/components/nav/AppShell";
import ImportarIbamaView from "./ImportarIbamaView";

export default async function ImportarIbamaPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const tenant = await prisma.tenant.findUnique({ where: { ownerId: user.id } });
  if (!tenant) {
    redirect("/onboarding");
  }

  const especies = await listarEspecies();

  return (
    <AppShell tenantName={tenant.name ?? "Ninhal"}>
      <ImportarIbamaView especies={especies} />
    </AppShell>
  );
}
