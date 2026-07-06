import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/nav/AppShell";
import Alert from "@/components/ui/Alert";
import PlantelList from "./PlantelList";

export default async function PlantelPage({
  searchParams,
}: {
  searchParams: Promise<{ aviso?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const tenant = await prisma.tenant.findUnique({ where: { ownerId: user.id } });
  if (!tenant) {
    redirect("/onboarding");
  }

  const especies = await prisma.especie.findMany({ orderBy: { nome: "asc" } });
  const { aviso } = await searchParams;

  return (
    <AppShell tenantName={tenant.name ?? "Ninhal"}>
      {aviso === "sem-aves-para-arvore" && (
        <div className="mb-4">
          <Alert
            variant="warning"
            title="Cadastre uma ave para ver a árvore genealógica"
            description="Ainda não há nenhuma ave no seu plantel — cadastre a primeira para poder consultar a árvore genealógica."
          />
        </div>
      )}
      <PlantelList especies={especies} />
    </AppShell>
  );
}
