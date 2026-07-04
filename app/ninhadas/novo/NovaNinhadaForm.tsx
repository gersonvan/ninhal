"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import Alert from "@/components/ui/Alert";
import { useParentesCandidatos } from "@/lib/aves/useParentesCandidatos";

interface Especie {
  id: string;
  nome: string;
}

const selectClass =
  "w-full box-border appearance-none font-sans text-[15px] px-4 py-3.5 rounded-[10px] border-[1.5px] border-input-border bg-white text-text-primary";

export default function NovaNinhadaForm({ especies }: { especies: Especie[] }) {
  const router = useRouter();

  const [especieId, setEspecieId] = useState(especies[0]?.id ?? "");
  const [machoId, setMachoId] = useState("");
  const [femeaId, setFemeaId] = useState("");
  const { pais: machos, maes: femeas } = useParentesCandidatos(especieId, "ATIVO");

  const [parentesco, setParentesco] = useState<{
    coeficiente: number;
    alertasAtivados: boolean;
  } | null>(null);

  const [pending, setPending] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!machoId || !femeaId) {
      return;
    }
    let cancelado = false;

    fetch(`/api/parentesco?machoId=${machoId}&femeaId=${femeaId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelado && data) setParentesco(data);
      });

    return () => {
      cancelado = true;
    };
  }, [machoId, femeaId]);

  const casalSelecionado = Boolean(machoId && femeaId);
  const mostrarRisco =
    casalSelecionado &&
    parentesco !== null &&
    parentesco.alertasAtivados &&
    parentesco.coeficiente > 0;
  const mostrarSeguro = casalSelecionado && parentesco !== null && !mostrarRisco;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);

    if (!machoId || !femeaId) {
      setErro("Selecione o macho e a fêmea do casal.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const dataPostura = String(formData.get("dataPostura") ?? "");
    const ovosPrevistosRaw = String(formData.get("ovosPrevistos") ?? "").trim();

    setPending(true);
    try {
      const res = await fetch("/api/ninhadas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anilhaMachoId: machoId,
          anilhaFemeaId: femeaId,
          dataPostura,
          ...(ovosPrevistosRaw ? { ovosPrevistos: Number(ovosPrevistosRaw) } : {}),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Não foi possível criar a ninhada.");
      }
      const ninhada = await res.json();
      router.push(`/ninhadas/${ninhada.id}`);
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Não foi possível criar a ninhada.",
      );
      setPending(false);
    }
  }

  return (
    <div className="max-w-[560px] mx-auto min-h-screen box-border">
      <div className="flex items-center gap-3.5 px-5 py-[18px] border-b border-border bg-background sticky top-0 z-[2]">
        <Link
          href="/ninhadas"
          className="w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center no-underline shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2B2A21" strokeWidth={2.2}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <div className="font-serif font-semibold text-xl text-text-primary">
          Nova ninhada
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-bold text-[#4a4638]">Espécie</label>
          <select
            value={especieId}
            onChange={(e) => {
              setEspecieId(e.target.value);
              setMachoId("");
              setFemeaId("");
            }}
            className={selectClass}
          >
            {especies.map((especie) => (
              <option key={especie.id} value={especie.id}>
                {especie.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-bold text-[#4a4638]">Macho</label>
          <select
            value={machoId}
            onChange={(e) => setMachoId(e.target.value)}
            className={selectClass}
          >
            <option value="">Selecione…</option>
            {machos.map((ave) => (
              <option key={ave.id} value={ave.id}>
                {ave.nomeApelido || ave.anilha} — {ave.anilha}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-bold text-[#4a4638]">Fêmea</label>
          <select
            value={femeaId}
            onChange={(e) => setFemeaId(e.target.value)}
            className={selectClass}
          >
            <option value="">Selecione…</option>
            {femeas.map((ave) => (
              <option key={ave.id} value={ave.id}>
                {ave.nomeApelido || ave.anilha} — {ave.anilha}
              </option>
            ))}
          </select>
        </div>

        {mostrarRisco && parentesco && (
          <Alert
            variant="warning"
            title="Atenção: risco de consanguinidade"
            description={`Coeficiente de parentesco estimado: ${parentesco.coeficiente}%. Você pode prosseguir mesmo assim, mas recomendamos revisar a árvore genealógica antes.`}
          />
        )}

        {mostrarSeguro && (
          <Alert
            variant="success"
            title="Nenhum parentesco direto encontrado entre esses dois indivíduos."
          />
        )}

        <div className="grid grid-cols-2 gap-3.5">
          <TextField name="dataPostura" label="Data de início" type="date" required />
          <TextField
            name="ovosPrevistos"
            label="Nº de ovos previstos"
            type="number"
            min={0}
            placeholder="Ex: 6"
          />
        </div>

        {erro && <p className="text-sm font-semibold text-terracota">{erro}</p>}

        <div className="flex gap-3 mt-2 pb-6">
          <Link
            href="/ninhadas"
            className="flex-1 text-center no-underline font-sans font-bold text-[15px] text-text-secondary border-[1.5px] border-border px-4 py-3.5 rounded-[10px]"
          >
            Cancelar
          </Link>
          <Button type="submit" disabled={pending} className="flex-1">
            {pending ? "Confirmando..." : "Confirmar ninhada"}
          </Button>
        </div>
      </form>
    </div>
  );
}
