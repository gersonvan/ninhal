import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { runWithTenant } from "@/lib/tenant/context";
import { listNinhadas } from "@/lib/ninhadas/service";
import { determinarStatusNinhada } from "@/lib/ninhadas/status";
import { alertasConsanguinidadeAtivados } from "@/lib/tenant/preferences";
import { montarAtividadeRecente } from "@/lib/dashboard/atividade";
import { horaAtualBrasil, saudacao } from "@/lib/dashboard/saudacao";
import AppShell from "@/components/nav/AppShell";
import DashboardView, {
  type NinhadaResumoDashboard,
} from "./DashboardView";

function nomeAve(ave: { nomeApelido: string | null; anilha: string }): string {
  return ave.nomeApelido || ave.anilha;
}

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

  const [avesAtivas, ninhadas, avesRecentes, alertasAtivados] =
    await Promise.all([
      runWithTenant(tenant.id, () =>
        prisma.ave.count({ where: { status: "ATIVO" } }),
      ),
      runWithTenant(tenant.id, () => listNinhadas()),
      runWithTenant(tenant.id, () =>
        prisma.ave.findMany({
          orderBy: { createdAt: "desc" },
          take: 4,
          select: { nomeApelido: true, anilha: true, createdAt: true },
        }),
      ),
      alertasConsanguinidadeAtivados(tenant.id),
    ]);

  const emAndamento: NinhadaResumoDashboard[] = ninhadas
    .filter((n) => n.filhotesNascidos == null)
    .map((n) => {
      const status = determinarStatusNinhada(n, alertasAtivados);
      return {
        id: n.id,
        codNinhada: n.codNinhada,
        nomeMacho: nomeAve(n.macho),
        nomeFemea: nomeAve(n.femea),
        nomeEspecie: n.macho.especie.nome,
        ovosBotados: n.ovosBotados,
        ovosFerteis: n.ovosFerteis,
        statusLabel: status.label,
        statusVariant: status.variant,
      };
    });
  const emRisco = emAndamento.filter((n) => n.statusVariant === "risk");

  const atividade = montarAtividadeRecente(
    avesRecentes,
    ninhadas.map((n) => ({ codNinhada: n.codNinhada, createdAt: n.createdAt })),
  );

  const primeiroNome = String(user.user_metadata?.full_name ?? "").split(
    " ",
  )[0];
  const saudacaoTexto = `${saudacao(horaAtualBrasil())}${
    primeiroNome ? `, ${primeiroNome}` : ""
  }`;

  return (
    <AppShell tenantName={tenant.name ?? "Ninhal"}>
      <DashboardView
        saudacaoTexto={saudacaoTexto}
        nomeCriatorio={tenant.name ?? "Ninhal"}
        avesAtivas={avesAtivas}
        emAndamento={emAndamento}
        emRisco={emRisco}
        atividade={atividade}
        agora={new Date()}
      />
    </AppShell>
  );
}
