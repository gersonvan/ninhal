"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Badge, { BIRD_STATUS_BADGE } from "@/components/ui/Badge";
import {
  SEXO_AVE_LABELS,
  STATUS_AVE_LABELS,
} from "@/lib/aves/labels";

interface Especie {
  id: string;
  nome: string;
}

interface AveListItem {
  id: string;
  nomeApelido: string | null;
  anilha: string;
  sexo: keyof typeof SEXO_AVE_LABELS;
  status: keyof typeof STATUS_AVE_LABELS;
  foto: string | null;
  especie: Especie;
  /** Indicador calculado (não é o campo `status`): a ave está em uma Ninhada em andamento. */
  emNinhada: boolean;
}

const SEXO_FILTROS = [
  { label: "Machos", value: "MACHO" },
  { label: "Fêmeas", value: "FEMEA" },
] as const;

const STATUS_FILTROS = (
  Object.entries(STATUS_AVE_LABELS) as [AveListItem["status"], string][]
).map(([value, label]) => ({ value, label }));

type ChipFiltro = { tipo: "sexo" | "especie"; valor: string } | null;

export default function PlantelList({ especies }: { especies: Especie[] }) {
  const [busca, setBusca] = useState("");
  const [buscaDebounced, setBuscaDebounced] = useState("");
  const [chipAtivo, setChipAtivo] = useState<ChipFiltro>(null);
  const [statusAtivo, setStatusAtivo] = useState<string | null>(null);
  const [aves, setAves] = useState<AveListItem[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => setBuscaDebounced(busca.trim()), 300);
    return () => clearTimeout(handle);
  }, [busca]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (buscaDebounced) params.set("busca", buscaDebounced);
    if (chipAtivo?.tipo === "sexo") params.set("sexo", chipAtivo.valor);
    if (chipAtivo?.tipo === "especie") params.set("especieId", chipAtivo.valor);
    if (statusAtivo) params.set("status", statusAtivo);
    return params.toString();
  }, [buscaDebounced, chipAtivo, statusAtivo]);

  useEffect(() => {
    let cancelado = false;

    fetch(`/api/aves${queryString ? `?${queryString}` : ""}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Não foi possível carregar o plantel.");
        return res.json();
      })
      .then((data: AveListItem[]) => {
        if (!cancelado) {
          setAves(data);
          setErro(null);
        }
      })
      .catch(() => {
        if (!cancelado) setErro("Não foi possível carregar o plantel.");
      });

    return () => {
      cancelado = true;
    };
  }, [queryString]);

  return (
    <div className="pb-6 min-[900px]:pb-0">
      <div className="max-w-[900px] mx-auto px-5 pt-5 pb-2 flex items-start justify-between gap-3">
        <div>
          <div className="font-serif font-semibold text-2xl text-text-primary">
            Plantel
          </div>
          <div className="font-sans text-[13px] text-text-muted mt-0.5">
            {aves === null ? "Carregando…" : `${aves.length} aves cadastradas`}
          </div>
        </div>
        <Link
          href="/configuracoes/importar-ibama"
          className="no-underline shrink-0 font-sans font-bold text-[13px] text-oliva-600 border-[1.5px] border-oliva-600 px-4 py-2.5 rounded-lg"
        >
          Importar do IBAMA
        </Link>
      </div>

      <div className="max-w-[900px] mx-auto px-5 py-3 flex flex-col gap-3">
        <div className="relative">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8a8578"
            strokeWidth={2.2}
            className="absolute left-3.5 top-3.5"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou anilha"
            className="w-full box-border font-sans text-[15px] pl-10 pr-4 py-3.5 rounded-[10px] border-[1.5px] border-input-border bg-white text-text-primary"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          <FiltroChip
            label="Todas"
            ativo={chipAtivo === null}
            onClick={() => setChipAtivo(null)}
          />
          {SEXO_FILTROS.map((f) => (
            <FiltroChip
              key={f.value}
              label={f.label}
              ativo={chipAtivo?.tipo === "sexo" && chipAtivo.valor === f.value}
              onClick={() => setChipAtivo({ tipo: "sexo", valor: f.value })}
            />
          ))}
          {especies.map((especie) => (
            <FiltroChip
              key={especie.id}
              label={especie.nome}
              ativo={chipAtivo?.tipo === "especie" && chipAtivo.valor === especie.id}
              onClick={() => setChipAtivo({ tipo: "especie", valor: especie.id })}
            />
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto">
          <FiltroChip
            label="Todos os status"
            ativo={statusAtivo === null}
            onClick={() => setStatusAtivo(null)}
          />
          {STATUS_FILTROS.map((f) => (
            <FiltroChip
              key={f.value}
              label={f.label}
              ativo={statusAtivo === f.value}
              onClick={() => setStatusAtivo(f.value)}
            />
          ))}
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-5 pb-6 pt-2 flex flex-col gap-2.5">
        {erro && <p className="text-sm font-semibold text-terracota">{erro}</p>}

        {aves !== null &&
          aves.length === 0 &&
          !erro &&
          (buscaDebounced || chipAtivo || statusAtivo ? (
            <p className="font-sans text-sm text-text-secondary text-center py-8">
              Nenhuma ave encontrada com esses filtros.
            </p>
          ) : (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg,#E4DCC8,#C9BB9A)",
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4B5D3A"
                  strokeWidth={1.8}
                >
                  <path d="M12 3c-3 2-5 5-5 9a5 5 0 0010 0c0-4-2-7-5-9z" />
                  <path d="M12 12v9" />
                  <path d="M8 21h8" />
                </svg>
              </div>
              <div>
                <p className="font-serif font-semibold text-lg text-text-primary m-0">
                  Seu plantel está vazio
                </p>
                <p className="font-sans text-sm text-text-secondary m-0 mt-1">
                  Cadastre sua primeira ave ou importe sua Relação de
                  Passeriformes do IBAMA.
                </p>
              </div>
              <div className="flex flex-col gap-2.5 w-full max-w-[300px]">
                <Link
                  href="/plantel/novo"
                  className="no-underline font-sans font-bold text-sm bg-oliva-600 text-background py-3 rounded-xl"
                >
                  Cadastrar primeira ave
                </Link>
                <Link
                  href="/configuracoes/importar-ibama"
                  className="no-underline font-sans font-bold text-sm text-oliva-600 border-[1.5px] border-oliva-600 py-3 rounded-xl"
                >
                  Importar do IBAMA
                </Link>
              </div>
            </div>
          ))}

        {aves?.map((ave) => {
          const statusLabel = STATUS_AVE_LABELS[ave.status];
          const badgeVariant = BIRD_STATUS_BADGE[statusLabel] ?? "neutral";
          return (
            <Link key={ave.id} href={`/plantel/${ave.id}`} className="no-underline">
              <Card className="p-3 flex items-center gap-3.5">
                {ave.foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={ave.foto}
                    alt={ave.nomeApelido ?? ave.anilha}
                    className="w-[52px] h-[52px] rounded-[10px] object-cover shrink-0"
                  />
                ) : (
                  <div
                    className="w-[52px] h-[52px] rounded-[10px] shrink-0"
                    style={{
                      background: "linear-gradient(135deg,#E4DCC8,#C9BB9A)",
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-serif font-semibold text-base text-text-primary truncate">
                    {ave.nomeApelido || ave.anilha}
                  </div>
                  <div className="font-sans text-xs text-text-muted truncate">
                    {ave.especie.nome} · {SEXO_AVE_LABELS[ave.sexo]}
                  </div>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  <div className="font-mono text-xs text-text-secondary">
                    {ave.anilha}
                  </div>
                  <div className="flex gap-1.5">
                    {ave.emNinhada && <Badge variant="warning">Em ninhada</Badge>}
                    <Badge variant={badgeVariant}>{statusLabel}</Badge>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function FiltroChip({
  label,
  ativo,
  onClick,
}: {
  label: string;
  ativo: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 font-sans font-bold text-[13px] px-4 py-2.5 rounded-full ${
        ativo
          ? "bg-oliva-600 text-background border-none"
          : "bg-white text-text-secondary border-[1.5px] border-border"
      }`}
    >
      {label}
    </button>
  );
}
