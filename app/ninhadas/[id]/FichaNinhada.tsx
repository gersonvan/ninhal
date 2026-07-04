"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import Badge, { BIRD_STATUS_BADGE } from "@/components/ui/Badge";
import Alert from "@/components/ui/Alert";
import { STATUS_AVE_LABELS } from "@/lib/aves/labels";
import { determinarStatusNinhada } from "@/lib/ninhadas/status";

interface Especie {
  id: string;
  nome: string;
}

interface AveResumo {
  id: string;
  nomeApelido: string | null;
  anilha: string;
  especieId: string;
  especie: Especie;
}

interface AveFilhote {
  id: string;
  nomeApelido: string | null;
  anilha: string;
  status: keyof typeof STATUS_AVE_LABELS;
}

interface NinhadaDetalhe {
  id: string;
  codNinhada: string;
  macho: AveResumo;
  femea: AveResumo;
  dataPostura: string | Date;
  ovosPrevistos: number | null;
  ovosBotados: number | null;
  ovosFerteis: number | null;
  filhotesNascidos: number | null;
  taxaEclosao: number | null;
  coeficienteParentesco: number;
}

function nomeAve(ave: AveResumo): string {
  return ave.nomeApelido || ave.anilha;
}

export default function FichaNinhada({
  ninhada,
  filhotes,
  alertasAtivados,
}: {
  ninhada: NinhadaDetalhe;
  filhotes: AveFilhote[];
  alertasAtivados: boolean;
}) {
  const [dados, setDados] = useState(ninhada);
  const [editando, setEditando] = useState(false);
  const [pending, setPending] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const status = determinarStatusNinhada(dados, alertasAtivados);
  const mostrarAlerta = alertasAtivados && dados.coeficienteParentesco > 0;

  async function salvarProgresso(formData: FormData) {
    setPending(true);
    setErro(null);

    const campos: Record<string, number> = {};
    for (const campo of ["ovosPrevistos", "ovosBotados", "ovosFerteis", "filhotesNascidos"]) {
      const valor = formData.get(campo);
      if (valor !== null && String(valor).trim() !== "") {
        campos[campo] = Number(valor);
      }
    }

    try {
      const res = await fetch(`/api/ninhadas/${dados.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campos),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Não foi possível salvar.");
      }
      const atualizada = await res.json();
      setDados((anterior) => ({ ...anterior, ...atualizada }));
      setEditando(false);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível salvar.");
    } finally {
      setPending(false);
    }
  }

  const gerarFilhotesHref = `/plantel/novo?paiId=${dados.macho.id}&maeId=${dados.femea.id}&especieId=${dados.macho.especieId}`;

  return (
    <div className="max-w-[640px] mx-auto min-h-screen box-border pb-10">
      <div className="flex items-center gap-3.5 px-5 py-[18px] border-b border-border bg-background sticky top-0 z-[2]">
        <Link
          href="/ninhadas"
          className="w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center no-underline shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2B2A21" strokeWidth={2.2}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <div className="flex-1">
          <div className="font-serif font-semibold text-xl text-text-primary">
            Ninhada #{dados.codNinhada}
          </div>
          <div className="font-sans text-[12.5px] text-text-muted">
            {nomeAve(dados.macho)} × {nomeAve(dados.femea)} · {dados.macho.especie.nome}
          </div>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      <div className="p-5 flex flex-col gap-5">
        {mostrarAlerta && (
          <Alert
            variant="warning"
            title="Atenção: risco de consanguinidade"
            description={`${nomeAve(dados.macho)} e ${nomeAve(dados.femea)} compartilham ancestrais próximos. Coeficiente estimado: ${dados.coeficienteParentesco}%.`}
          />
        )}

        {!editando ? (
          <>
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Ovos" valor={dados.ovosBotados} />
              <StatCard label="Férteis" valor={dados.ovosFerteis} />
              <StatCard label="Nascidos" valor={dados.filhotesNascidos} />
            </div>

            {dados.taxaEclosao != null && (
              <div className="bg-success-bg border border-oliva-400 rounded-xl px-4 py-3.5 flex justify-between items-center">
                <div className="font-sans font-bold text-sm text-success-text">
                  Taxa de eclosão
                </div>
                <div className="font-serif font-semibold text-[22px] text-success-text">
                  {Math.round(dados.taxaEclosao)}%
                </div>
              </div>
            )}

            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditando(true)}
            >
              Atualizar acompanhamento
            </Button>

            {filhotes.length > 0 && (
              <div>
                <div className="font-serif font-semibold text-lg text-text-primary mb-3">
                  Filhotes gerados
                </div>
                <div className="flex flex-col gap-2">
                  {filhotes.map((filhote) => {
                    const label = STATUS_AVE_LABELS[filhote.status];
                    const variant = BIRD_STATUS_BADGE[label] ?? "neutral";
                    return (
                      <Link
                        key={filhote.id}
                        href={`/plantel/${filhote.id}`}
                        className="no-underline bg-white border border-border rounded-xl px-3.5 py-3 flex items-center gap-2.5"
                      >
                        <div className="w-[34px] h-[34px] rounded-lg bg-border shrink-0" />
                        <div className="flex-1 font-sans font-bold text-sm text-text-primary">
                          {filhote.nomeApelido || filhote.anilha}
                        </div>
                        <Badge variant={variant}>{label}</Badge>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            <Link
              href={gerarFilhotesHref}
              className="text-center no-underline font-sans font-bold text-[15px] text-background bg-oliva-600 px-4 py-3.5 rounded-[10px]"
            >
              Gerar filhotes na árvore
            </Link>

            <Link
              href="/arvore"
              className="flex items-center justify-center gap-2 no-underline font-sans font-bold text-sm text-oliva-600 border-[1.5px] border-oliva-600 rounded-[10px] p-3"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B5D3A" strokeWidth={2}>
                <circle cx="12" cy="5" r="2.5" />
                <circle cx="6" cy="19" r="2.5" />
                <circle cx="18" cy="19" r="2.5" />
                <path d="M12 7.5V13M12 13L6 16.5M12 13l6 3.5" />
              </svg>
              Ver na árvore genealógica
            </Link>
          </>
        ) : (
          <form action={salvarProgresso} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3.5">
              <TextField
                name="ovosPrevistos"
                label="Ovos previstos"
                type="number"
                min={0}
                defaultValue={dados.ovosPrevistos ?? ""}
              />
              <TextField
                name="ovosBotados"
                label="Ovos botados"
                type="number"
                min={0}
                defaultValue={dados.ovosBotados ?? ""}
              />
              <TextField
                name="ovosFerteis"
                label="Ovos férteis"
                type="number"
                min={0}
                defaultValue={dados.ovosFerteis ?? ""}
              />
              <TextField
                name="filhotesNascidos"
                label="Filhotes nascidos"
                type="number"
                min={0}
                defaultValue={dados.filhotesNascidos ?? ""}
              />
            </div>

            {erro && <p className="text-sm font-semibold text-terracota">{erro}</p>}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setEditando(false);
                  setErro(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={pending} className="flex-1">
                {pending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, valor }: { label: string; valor: number | null }) {
  return (
    <div className="bg-white border border-border rounded-xl p-3.5 text-center">
      <div className="font-serif font-semibold text-2xl text-text-primary">
        {valor ?? "—"}
      </div>
      <div className="font-sans font-bold text-[11px] text-text-muted uppercase">
        {label}
      </div>
    </div>
  );
}
