import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { signOut } from "@/lib/auth/actions";
import AppShell from "@/components/nav/AppShell";
import Button from "@/components/ui/Button";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const tenant = await prisma.tenant.findUnique({
    where: { ownerId: user.id },
  });

  if (!tenant) {
    redirect("/onboarding");
  }

  return (
    <AppShell tenantName={tenant.name ?? "Ninhal"}>
      <div className="min-h-full flex flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="font-serif font-semibold text-2xl text-text-primary m-0">
          Bem-vindo(a), {tenant.name}
        </h1>
        <p className="font-sans text-sm text-text-secondary m-0">
          O painel completo será construído em uma próxima etapa.
        </p>
        <form action={signOut}>
          <Button type="submit" variant="tertiary">
            Sair
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
