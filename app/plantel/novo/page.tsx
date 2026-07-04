import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/nav/AppShell";
import NovoCadastroForm from "./NovoCadastroForm";

interface PageProps {
  searchParams: Promise<{ paiId?: string; maeId?: string; especieId?: string }>;
}

export default async function NovoCadastroPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const tenant = await prisma.tenant.findUnique({ where: { ownerId: user.id } });
  if (!tenant) {
    redirect("/onboarding");
  }

  const especies = await prisma.especie.findMany({ orderBy: { nome: "asc" } });
  const { paiId, maeId, especieId } = await searchParams;

  return (
    <AppShell tenantName={tenant.name ?? "Ninhal"}>
      <NovoCadastroForm
        especies={especies}
        preselecao={{ paiId, maeId, especieId }}
      />
    </AppShell>
  );
}
