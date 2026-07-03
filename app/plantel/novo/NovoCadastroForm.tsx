"use client";

import { useActionState, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { createAveAction } from "@/lib/aves/actions";

interface Especie {
  id: string;
  nome: string;
}

interface AveCandidata {
  id: string;
  nomeApelido: string | null;
  anilha: string;
}

const selectClass =
  "w-full box-border appearance-none font-sans text-[15px] px-4 py-3.5 rounded-[10px] border-[1.5px] border-input-border bg-white text-text-primary";

export default function NovoCadastroForm({ especies }: { especies: Especie[] }) {
  const [state, formAction, pending] = useActionState(createAveAction, null);

  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [especieId, setEspecieId] = useState(especies[0]?.id ?? "");
  const [sexo, setSexo] = useState<"MACHO" | "FEMEA" | "NAO_SEXADO">("FEMEA");
  const [origem, setOrigem] = useState<"NASCIDA_NO_CRIATORIO" | "ADQUIRIDA">(
    "NASCIDA_NO_CRIATORIO",
  );
  const [pais, setPais] = useState<AveCandidata[]>([]);
  const [maes, setMaes] = useState<AveCandidata[]>([]);

  useEffect(() => {
    let cancelado = false;

    if (!especieId) {
      return () => {
        cancelado = true;
      };
    }

    fetch(`/api/aves?especieId=${especieId}&sexo=MACHO`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: AveCandidata[]) => {
        if (!cancelado) setPais(data);
      });

    fetch(`/api/aves?especieId=${especieId}&sexo=FEMEA`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: AveCandidata[]) => {
        if (!cancelado) setMaes(data);
      });

    return () => {
      cancelado = true;
    };
  }, [especieId]);

  function handleFotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setFotoPreview(file ? URL.createObjectURL(file) : null);
  }

  return (
    <div className="max-w-[560px] mx-auto min-h-screen box-border">
      <div className="flex items-center gap-3.5 px-5 py-[18px] border-b border-border bg-background sticky top-0 z-[2]">
        <a
          href="/plantel"
          className="w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center no-underline shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2B2A21" strokeWidth={2.2}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </a>
        <div className="font-serif font-semibold text-xl text-text-primary">
          Nova ave
        </div>
      </div>

      <form action={formAction} className="p-5 flex flex-col gap-5">
        <div className="flex justify-center">
          <label
            htmlFor="foto"
            className="w-[120px] h-[120px] rounded-full border-[1.5px] border-dashed border-input-border bg-white flex items-center justify-center text-text-muted text-sm cursor-pointer overflow-hidden"
          >
            {fotoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fotoPreview}
                alt="Pré-visualização da foto"
                className="w-full h-full object-cover"
              />
            ) : (
              "Adicionar foto"
            )}
          </label>
          <input
            id="foto"
            name="foto"
            type="file"
            accept="image/*"
            onChange={handleFotoChange}
            className="hidden"
          />
        </div>

        <TextField
          name="nomeApelido"
          label="Nome"
          placeholder="Ex: Amália"
        />

        <div className="grid grid-cols-2 gap-3.5">
          <TextField name="anilha" label="Anilha" placeholder="BR-2026-0000" required />
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-[#4a4638]">Sexo</label>
            <div className="flex bg-tab-track rounded-[10px] p-1">
              {(
                [
                  { value: "MACHO", label: "Macho" },
                  { value: "FEMEA", label: "Fêmea" },
                  { value: "NAO_SEXADO", label: "Não sexado" },
                ] as const
              ).map((opcao) => (
                <button
                  key={opcao.value}
                  type="button"
                  onClick={() => setSexo(opcao.value)}
                  className={`flex-1 py-2 rounded-lg font-sans font-bold text-xs cursor-pointer ${
                    sexo === opcao.value
                      ? "bg-oliva-600 text-background"
                      : "bg-transparent text-text-secondary"
                  }`}
                >
                  {opcao.label}
                </button>
              ))}
            </div>
            <input type="hidden" name="sexo" value={sexo} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-bold text-[#4a4638]">Espécie</label>
          <div className="relative">
            <select
              name="especieId"
              value={especieId}
              onChange={(e) => setEspecieId(e.target.value)}
              className={selectClass}
            >
              {especies.map((especie) => (
                <option key={especie.id} value={especie.id}>
                  {especie.nome}
                </option>
              ))}
            </select>
            <ChevronDown />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <TextField name="mutacaoCor" label="Mutação / cor" placeholder="Ex: Isabela" />
          <TextField name="dataNascimento" label="Nascimento" type="date" />
        </div>

        <div className="h-px bg-border" />

        <div>
          <div className="font-serif font-semibold text-lg text-text-primary mb-1">
            Genealogia
          </div>
          <p className="font-sans text-[13px] text-text-secondary mb-3.5 leading-normal">
            A seleção de pai e mãe é restrita a aves da mesma espécie já
            cadastradas no seu plantel — isso garante uma árvore genealógica
            confiável.
          </p>
          <div className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-[#4a4638]">
                Pai (machos da espécie selecionada no plantel)
              </label>
              <div className="relative">
                <select name="anilhaPaiId" defaultValue="" className={selectClass}>
                  <option value="">Nenhum / desconhecido</option>
                  {pais.map((ave) => (
                    <option key={ave.id} value={ave.id}>
                      {ave.nomeApelido || ave.anilha} — {ave.anilha}
                    </option>
                  ))}
                </select>
                <ChevronDown />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-[#4a4638]">
                Mãe (fêmeas da espécie selecionada no plantel)
              </label>
              <div className="relative">
                <select name="anilhaMaeId" defaultValue="" className={selectClass}>
                  <option value="">Nenhuma / desconhecida</option>
                  {maes.map((ave) => (
                    <option key={ave.id} value={ave.id}>
                      {ave.nomeApelido || ave.anilha} — {ave.anilha}
                    </option>
                  ))}
                </select>
                <ChevronDown />
              </div>
            </div>
          </div>
          <div className="bg-info-bg border-[1.5px] border-[#7C93AD] rounded-[10px] px-3.5 py-3 mt-3 font-sans text-[12.5px] text-info-text flex gap-2">
            <span>ⓘ</span>
            <span>
              Não encontrou pai/mãe na lista? Cadastre a ave dos genitores
              primeiro, ou marque como &quot;Adquirida&quot;.
            </span>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-bold text-[#4a4638]">Origem</label>
          <div className="flex bg-tab-track rounded-[10px] p-1">
            {(
              [
                { value: "NASCIDA_NO_CRIATORIO", label: "Nascida no criatório" },
                { value: "ADQUIRIDA", label: "Adquirida" },
              ] as const
            ).map((opcao) => (
              <button
                key={opcao.value}
                type="button"
                onClick={() => setOrigem(opcao.value)}
                className={`flex-1 py-2.5 rounded-lg font-sans font-bold text-[13px] cursor-pointer ${
                  origem === opcao.value
                    ? "bg-oliva-600 text-background"
                    : "bg-transparent text-text-secondary"
                }`}
              >
                {opcao.label}
              </button>
            ))}
          </div>
          <input type="hidden" name="origem" value={origem} />
        </div>

        {state?.error && (
          <p className="text-sm font-semibold text-terracota">{state.error}</p>
        )}

        <div className="flex gap-3 mt-2 pb-6">
          <a
            href="/plantel"
            className="flex-1 text-center no-underline font-sans font-bold text-[15px] text-text-secondary border-[1.5px] border-border px-4 py-3.5 rounded-[10px]"
          >
            Cancelar
          </a>
          <Button type="submit" disabled={pending} className="flex-1">
            {pending ? "Salvando..." : "Salvar ave"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function ChevronDown() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6b6656"
      strokeWidth={2.2}
      className="absolute right-3.5 top-4 pointer-events-none"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
