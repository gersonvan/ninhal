import Link from "next/link";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import { formatarTempoRelativo, type AtividadeItem } from "@/lib/dashboard/atividade";

export interface NinhadaResumoDashboard {
  id: string;
  codNinhada: string;
  nomeMacho: string;
  nomeFemea: string;
  nomeEspecie: string;
  ovosBotados: number | null;
  ovosFerteis: number | null;
  statusLabel: string;
  statusVariant: BadgeVariant;
}

export interface DashboardViewProps {
  saudacaoTexto: string;
  nomeCriatorio: string;
  avesAtivas: number;
  emAndamento: NinhadaResumoDashboard[];
  emRisco: NinhadaResumoDashboard[];
  atividade: AtividadeItem[];
  agora: Date;
}

/** Conteúdo do Dashboard (design/03 Dashboard.dc.html), separado da busca de dados. */
export default function DashboardView({
  saudacaoTexto,
  nomeCriatorio,
  avesAtivas,
  emAndamento,
  emRisco,
  atividade,
  agora,
}: DashboardViewProps) {
  return (
    <div className="pb-6 min-[900px]:pb-0">
      <div className="max-w-[900px] mx-auto px-5 pt-5 pb-2">
        <div className="font-sans text-[13px] text-text-muted">
          {saudacaoTexto}
        </div>
        <div className="font-serif font-semibold text-2xl text-text-primary">
          {nomeCriatorio}
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-5 py-4 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3.5">
        <div className="bg-white border border-border rounded-[14px] p-4">
          <div className="font-sans font-bold text-[11px] tracking-[0.04em] uppercase text-text-muted">
            Aves ativas
          </div>
          <div className="font-serif font-semibold text-[32px] text-text-primary">
            {avesAtivas}
          </div>
        </div>
        <div className="bg-white border border-border rounded-[14px] p-4">
          <div className="font-sans font-bold text-[11px] tracking-[0.04em] uppercase text-text-muted">
            Ninhadas em curso
          </div>
          <div className="font-serif font-semibold text-[32px] text-text-primary">
            {emAndamento.length}
          </div>
        </div>
        {/* O card de Alertas só ganha o destaque âmbar do design quando há
            alerta de fato — âmbar com zero seria um falso alarme visual. */}
        {emRisco.length > 0 ? (
          <div className="bg-warning-bg border-[1.5px] border-ambar rounded-[14px] p-4">
            <div className="font-sans font-bold text-[11px] tracking-[0.04em] uppercase text-[#8B5A24]">
              Alertas
            </div>
            <div className="font-serif font-semibold text-[32px] text-[#6B3E17]">
              {emRisco.length}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-[14px] p-4">
            <div className="font-sans font-bold text-[11px] tracking-[0.04em] uppercase text-text-muted">
              Alertas
            </div>
            <div className="font-serif font-semibold text-[32px] text-text-primary">
              0
            </div>
          </div>
        )}
      </div>

      {emRisco.map((ninhada) => (
        <div key={ninhada.id} className="max-w-[900px] mx-auto px-5 pb-4">
          <div className="bg-warning-bg border-[1.5px] border-ambar rounded-[14px] px-[18px] py-4 flex gap-3 items-start">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8B5A24"
              strokeWidth={2}
              className="shrink-0"
            >
              <path d="M12 2L1 21h22L12 2z" />
              <path d="M12 9v5M12 17h.01" />
            </svg>
            <div className="flex-1">
              <div className="font-sans font-extrabold text-sm text-[#6B3E17]">
                Risco de consanguinidade — Ninhada #{ninhada.codNinhada}
              </div>
              <div className="font-sans text-[13px] text-[#6B3E17] mt-0.5">
                {ninhada.nomeFemea} × {ninhada.nomeMacho} têm parentesco
                detectado. Revise antes de confirmar.
              </div>
            </div>
            <Link
              href={`/ninhadas/${ninhada.id}`}
              className="font-sans font-bold text-[13px] text-[#6B3E17] underline whitespace-nowrap"
            >
              Revisar
            </Link>
          </div>
        </div>
      ))}

      <div className="max-w-[900px] mx-auto px-5 pb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif font-semibold text-[19px] text-text-primary m-0">
            Ninhadas em andamento
          </h2>
          <Link
            href="/ninhadas"
            className="no-underline font-sans font-bold text-[13px] text-oliva-600"
          >
            Ver todas
          </Link>
        </div>
        {emAndamento.length === 0 ? (
          <p className="font-sans text-sm text-text-secondary m-0">
            Nenhuma ninhada em andamento.{" "}
            <Link href="/ninhadas/novo" className="font-bold text-oliva-600">
              Registrar ninhada
            </Link>
          </p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3.5">
            {emAndamento.slice(0, 4).map((ninhada) => {
              const progresso = ninhada.ovosBotados
                ? Math.round(
                    ((ninhada.ovosFerteis ?? 0) / ninhada.ovosBotados) * 100,
                  )
                : 0;
              return (
                <Link
                  key={ninhada.id}
                  href={`/ninhadas/${ninhada.id}`}
                  className="no-underline bg-white border border-border rounded-[14px] p-4 flex flex-col gap-2.5"
                >
                  <div className="flex justify-between items-center">
                    <div className="font-sans font-bold text-sm text-text-primary">
                      Ninhada #{ninhada.codNinhada}
                    </div>
                    <Badge variant={ninhada.statusVariant}>
                      {ninhada.statusLabel}
                    </Badge>
                  </div>
                  <div className="font-sans text-xs text-text-muted">
                    {ninhada.nomeFemea} × {ninhada.nomeMacho} ·{" "}
                    {ninhada.nomeEspecie}
                  </div>
                  <div className="h-1.5 rounded-full bg-border">
                    <div
                      className="h-1.5 rounded-full bg-oliva-600"
                      style={{ width: `${progresso}%` }}
                    />
                  </div>
                  <div className="font-sans text-[11px] text-text-muted">
                    {ninhada.ovosFerteis ?? 0} de {ninhada.ovosBotados ?? 0}{" "}
                    ovos férteis
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {atividade.length > 0 && (
        <div className="max-w-[900px] mx-auto px-5 pb-8">
          <h2 className="font-serif font-semibold text-[19px] text-text-primary m-0 mb-3">
            Atividade recente
          </h2>
          <div className="bg-white border border-border rounded-[14px] overflow-hidden">
            {atividade.map((item, indice) => (
              <div
                key={`${item.tipo}-${item.titulo}-${item.createdAt.getTime()}`}
                className={`px-[18px] py-3.5 flex items-center gap-3 ${
                  indice < atividade.length - 1
                    ? "border-b border-[#F0EBDD]"
                    : ""
                }`}
              >
                <div
                  className={`w-[34px] h-[34px] rounded-[9px] flex items-center justify-center shrink-0 ${
                    item.tipo === "ave" ? "bg-success-bg" : "bg-warning-bg"
                  }`}
                >
                  {item.tipo === "ave" ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#3C4A2F"
                      strokeWidth={2}
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#8B5A24"
                      strokeWidth={2}
                    >
                      <ellipse cx="12" cy="13" rx="6" ry="8" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-sans text-sm text-text-primary">
                    {item.tipo === "ave" ? (
                      <>
                        <strong>{item.titulo}</strong> foi cadastrada no
                        plantel
                      </>
                    ) : (
                      <>
                        Ninhada <strong>{item.titulo}</strong> foi registrada
                      </>
                    )}
                  </div>
                  <div className="font-sans text-xs text-text-muted">
                    {formatarTempoRelativo(item.createdAt, agora)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
