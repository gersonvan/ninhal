import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/nav/AppShell";
import NovaNinhadaForm from "./NovaNinhadaForm";

export default async function NovaNinhadaPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const tenant = await prisma.tenant.findUnique({ where: { ownerId: user.id } });
  if (!tenant) {
    redirect("/onboarding");
  }

  const especies = await prisma.especie.findMany({ orderBy: { nome: "asc" } });

  return (
    <AppShell tenantName={tenant.name ?? "Ninhal"}>
      <NovaNinhadaForm especies={especies} />
    </AppShell>
  );
}
