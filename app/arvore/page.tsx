import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { runWithTenant } from "@/lib/tenant/context";

export default async function ArvoreGenealogicaIndexPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const tenant = await prisma.tenant.findUnique({ where: { ownerId: user.id } });
  if (!tenant) {
    redirect("/onboarding");
  }

  const primeiraAve = await runWithTenant(tenant.id, () =>
    prisma.ave.findFirst({ orderBy: { createdAt: "asc" } }),
  );

  if (!primeiraAve) {
    redirect("/plantel?aviso=sem-aves-para-arvore");
  }

  redirect(`/arvore/${primeiraAve.id}`);
}
