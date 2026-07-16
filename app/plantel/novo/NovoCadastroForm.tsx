"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { createAveAction } from "@/lib/aves/actions";
import { redimensionarFoto, validarTamanhoFoto } from "@/lib/aves/foto";
import { useParentesCandidatos } from "@/lib/aves/useParentesCandidatos";
import { criarEspecie } from "@/lib/especies/client";

interface Especie {
  id: string;
  nome: string;
}

export interface PreselecaoNovaAve {
  especieId?: string;
  paiId?: string;
  maeId?: string;
}

const selectClass =
  "w-full box-border appearance-none font-sans text-[15px] px-4 py-3.5 rounded-[10px] border-[1.5px] border-input-border bg-white text-text-primary";

/** Valor sentinela da opção "Adicionar nova espécie" — nunca é submetido como especieId. */
const ADICIONAR_ESPECIE_VALUE = "__adicionar_especie__";

export default function NovoCadastroForm({
  especies,
  preselecao,
}: {
  especies: Especie[];
  preselecao?: PreselecaoNovaAve;
}) {
  const [state, formAction, pending] = useActionState(createAveAction, null);

  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoErro, setFotoErro] = useState<string | null>(null);
  const [otimizandoFoto, setOtimizandoFoto] = useState(false);
  const [listaEspecies, setListaEspecies] = useState(especies);
  const [especieId, setEspecieId] = useState(
    preselecao?.especieId ?? especies[0]?.id ?? "",
  );
  const [sexo, setSexo] = useState<"MACHO" | "FEMEA" | "NAO_SEXADO">("FEMEA");
  const [origem, setOrigem] = useState<"NASCIDA_NO_CRIATORIO" | "ADQUIRIDA">(
    "NASCIDA_NO_CRIATORIO",
  );
  const [paiId, setPaiId] = useState(preselecao?.paiId ?? "");
  const [maeId, setMaeId] = useState(preselecao?.maeId ?? "");
  const { pais, maes } = useParentesCandidatos(especieId);

  const [adicionandoEspecie, setAdicionandoEspecie] = useState(false);
  const [novaEspecieNome, setNovaEspecieNome] = useState("");
  const [salvandoEspecie, setSalvandoEspecie] = useState(false);
  const [erroEspecie, setErroEspecie] = useState<string | null>(null);

  async function handleFotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setFotoErro(null);
      setFotoPreview(null);
      return;
    }

    setOtimizandoFoto(true);
    const otimizada = await redimensionarFoto(file);
    setOtimizandoFoto(false);

    const erro = validarTamanhoFoto(otimizada);
    if (erro) {
      setFotoErro(erro);
      event.target.value = "";
      return;
    }

    const transferencia = new DataTransfer();
    transferencia.items.add(otimizada);
    event.target.files = transferencia.files;

    setFotoErro(null);
    setFotoPreview(URL.createObjectURL(otimizada));
  }

  async function handleAdicionarEspecie() {
    const nome = novaEspecieNome.trim();
    if (!nome) return;

    setSalvandoEspecie(true);
    setErroEspecie(null);
    try {
      const especie = await criarEspecie(nome);
      setListaEspecies((atual) => {
        if (atual.some((e) => e.id === especie.id)) return atual;
        return [...atual, especie].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
      });
      setEspecieId(especie.id);
      setNovaEspecieNome("");
      setAdicionandoEspecie(false);
    } catch (error) {
      setErroEspecie(
        error instanceof Error ? error.message : "Não foi possível adicionar a espécie.",
      );
    } finally {
      setSalvandoEspecie(false);
    }
  }

  return (
    <div className="max-w-[560px] mx-auto min-h-screen box-border">
      <div className="flex items-center gap-3.5 px-5 py-[18px] border-b border-border bg-background sticky top-0 z-[2]">
        <Link
          href="/plantel"
          className="w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center no-underline shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2B2A21" strokeWidth={2.2}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
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
            {otimizandoFoto ? (
              "Otimizando foto…"
            ) : fotoPreview ? (
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
        {fotoErro && (
          <p className="text-sm font-semibold text-terracota text-center -mt-3">
            {fotoErro}
          </p>
        )}

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
              onChange={(e) => {
                // A opção de adicionar vive dentro do próprio dropdown porque é
                // ali que o usuário está olhando quando não encontra a espécie;
                // ela abre o formulário inline sem trocar a seleção atual.
                if (e.target.value === ADICIONAR_ESPECIE_VALUE) {
                  setAdicionandoEspecie(true);
                  return;
                }
                setEspecieId(e.target.value);
              }}
              className={selectClass}
            >
              {listaEspecies.map((especie) => (
                <option key={especie.id} value={especie.id}>
                  {especie.nome}
                </option>
              ))}
              <option value={ADICIONAR_ESPECIE_VALUE}>
                ＋ Adicionar nova espécie…
              </option>
            </select>
            <ChevronDown />
          </div>

          {adicionandoEspecie ? (
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex gap-2">
                <TextField
                  value={novaEspecieNome}
                  onChange={(e) => setNovaEspecieNome(e.target.value)}
                  placeholder="Nome da nova espécie"
                  className="flex-1"
                />
                <Button
                  type="button"
                  size="small"
                  onClick={handleAdicionarEspecie}
                  disabled={salvandoEspecie || !novaEspecieNome.trim()}
                >
                  {salvandoEspecie ? "Adicionando..." : "Adicionar"}
                </Button>
                <Button
                  type="button"
                  variant="tertiary"
                  size="small"
                  onClick={() => {
                    setAdicionandoEspecie(false);
                    setNovaEspecieNome("");
                    setErroEspecie(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
              {erroEspecie && (
                <p className="text-xs font-semibold text-terracota m-0">{erroEspecie}</p>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdicionandoEspecie(true)}
              className="self-start bg-transparent border-none font-sans font-bold text-[13px] text-oliva-600 cursor-pointer p-0 mt-1"
            >
              Não encontrou sua espécie? Adicione aqui
            </button>
          )}
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
                <select
                  name="anilhaPaiId"
                  value={paiId}
                  onChange={(e) => setPaiId(e.target.value)}
                  className={selectClass}
                >
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
                <select
                  name="anilhaMaeId"
                  value={maeId}
                  onChange={(e) => setMaeId(e.target.value)}
                  className={selectClass}
                >
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

        {origem === "ADQUIRIDA" && (
          <TextField
            name="origemDetalhe"
            label="De onde foi adquirida"
            placeholder="Ex: Criatório Serra Verde, Loja Aves & Cia"
          />
        )}

        {state?.error && (
          <p className="text-sm font-semibold text-terracota">{state.error}</p>
        )}

        <div className="flex gap-3 mt-2 pb-6">
          <Link
            href="/plantel"
            className="flex-1 text-center no-underline font-sans font-bold text-[15px] text-text-secondary border-[1.5px] border-border px-4 py-3.5 rounded-[10px]"
          >
            Cancelar
          </Link>
          <Button type="submit" disabled={pending || otimizandoFoto} className="flex-1">
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
