import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { runWithTenant } from "@/lib/tenant/context";
import { listNinhadas } from "@/lib/ninhadas/service";
import { determinarStatusNinhada } from "@/lib/ninhadas/status";
import { alertasConsanguinidadeAtivados } from "@/lib/tenant/preferences";
import AppShell from "@/components/nav/AppShell";
import Badge from "@/components/ui/Badge";

function nomeAve(ave: { nomeApelido: string | null; anilha: string }): string {
  return ave.nomeApelido || ave.anilha;
}

function formatarData(data: Date | string): string {
  return new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export default async function ListaDeNinhadasPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const tenant = await prisma.tenant.findUnique({ where: { ownerId: user.id } });
  if (!tenant) {
    redirect("/onboarding");
  }

  const [ninhadas, alertasAtivados] = await Promise.all([
    runWithTenant(tenant.id, () => listNinhadas()),
    alertasConsanguinidadeAtivados(tenant.id),
  ]);

  return (
    <AppShell tenantName={tenant.name ?? "Ninhal"}>
      <div className="pb-6 min-[900px]:pb-0">
        <div className="max-w-[900px] mx-auto px-5 pt-5 pb-2 flex items-center justify-between">
          <div>
            <div className="font-serif font-semibold text-2xl text-text-primary">
              Ninhadas
            </div>
            <div className="font-sans text-[13px] text-text-muted mt-0.5">
              {ninhadas.length} ninhadas registradas
            </div>
          </div>
          <Link
            href="/ninhadas/novo"
            className="w-[42px] h-[42px] rounded-xl bg-oliva-600 flex items-center justify-center shrink-0 no-underline"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4}>
              <path d="M12 5v14M5 12h14" />
            </svg>
          </Link>
        </div>

        <div className="max-w-[900px] mx-auto px-5 py-3 flex flex-col gap-3">
          {ninhadas.length === 0 && (
            <p className="font-sans text-sm text-text-secondary text-center py-8">
              Nenhuma ninhada registrada ainda.
            </p>
          )}

          {ninhadas.map((ninhada) => {
            const status = determinarStatusNinhada(ninhada, alertasAtivados);
            const encerrada = ninhada.filhotesNascidos != null;
            const progresso = encerrada
              ? 100
              : ninhada.ovosBotados
                ? Math.round(((ninhada.ovosFerteis ?? 0) / ninhada.ovosBotados) * 100)
                : 0;
            const corBarra = encerrada ? "#7C9364" : "#4B5D3A";

            const detalhes = encerrada
              ? `${ninhada.ovosBotados ?? 0} ovos · ${ninhada.ovosFerteis ?? 0} férteis · ${ninhada.filhotesNascidos} nascidos · ${Math.round(ninhada.taxaEclosao ?? 0)}% de eclosão`
              : `${ninhada.ovosBotados ?? 0} ovos · ${ninhada.ovosFerteis ?? 0} férteis · aguardando eclosão`;

            return (
              <Link
                key={ninhada.id}
                href={`/ninhadas/${ninhada.id}`}
                className={`no-underline bg-white rounded-2xl p-4 flex flex-col gap-2.5 ${
                  status.variant === "risk"
                    ? "border-[1.5px] border-terracota"
                    : "border border-border"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="font-sans font-bold text-[15px] text-text-primary">
                    Ninhada #{ninhada.codNinhada}
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <div className="font-sans text-[13px] text-text-secondary">
                  {nomeAve(ninhada.femea)} × {nomeAve(ninhada.macho)} ·{" "}
                  {ninhada.macho.especie.nome} · iniciada{" "}
                  {formatarData(ninhada.dataPostura)}
                </div>
                <div className="h-1.5 rounded-full bg-border">
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${progresso}%`, background: corBarra }}
                  />
                </div>
                <div className="font-sans text-xs text-text-muted">{detalhes}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
