import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { signOut } from "@/lib/auth/actions";

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
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 bg-background text-center">
      <h1 className="font-serif font-semibold text-2xl text-text-primary m-0">
        Bem-vindo(a), {tenant.name}
      </h1>
      <p className="font-sans text-sm text-text-secondary m-0">
        O painel completo será construído em uma próxima etapa.
      </p>
      <form action={signOut}>
        <button
          type="submit"
          className="font-sans font-bold text-sm text-oliva-600 bg-transparent border-none cursor-pointer"
        >
          Sair
        </button>
      </form>
    </div>
  );
}
