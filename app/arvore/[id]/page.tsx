import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { runWithTenant } from "@/lib/tenant/context";
import { getAve } from "@/lib/aves/service";
import { montarArvoreGenealogica } from "@/lib/arvore/service";
import { buscarNinhadaAtivaDaAve } from "@/lib/ninhadas/service";
import { determinarStatusNinhada } from "@/lib/ninhadas/status";
import { alertasConsanguinidadeAtivados } from "@/lib/tenant/preferences";
import AppShell from "@/components/nav/AppShell";
import ArvoreView from "./ArvoreView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ArvoreGenealogicaPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const tenant = await prisma.tenant.findUnique({ where: { ownerId: user.id } });
  if (!tenant) {
    redirect("/onboarding");
  }

  const { id } = await params;

  // Busca a ave primeiro e sozinha: `montarArvoreGenealogica` lança uma
  // exceção se a ave não existir, e rodar as duas junto num `Promise.all`
  // faria essa exceção escapar antes do `notFound()` abaixo rodar — um link
  // antigo/favoritado para uma ave já excluída quebraria a página em vez de
  // mostrar "não encontrado".
  const ave = await runWithTenant(tenant.id, () => getAve(id));
  if (!ave) {
    notFound();
  }

  const [arvore, alertasAtivados, ninhadaAtiva] = await Promise.all([
    runWithTenant(tenant.id, () => montarArvoreGenealogica(id)),
    alertasConsanguinidadeAtivados(tenant.id),
    runWithTenant(tenant.id, () => buscarNinhadaAtivaDaAve(id)),
  ]);
  const statusNinhada = ninhadaAtiva
    ? determinarStatusNinhada(ninhadaAtiva, alertasAtivados)
    : null;
  const mostrarBannerRisco = statusNinhada?.variant === "risk";

  return (
    <AppShell tenantName={tenant.name ?? "Ninhal"}>
      <ArvoreView
        ave={ave}
        arvore={arvore}
        ninhadaAtiva={mostrarBannerRisco ? ninhadaAtiva : null}
      />
    </AppShell>
  );
}
