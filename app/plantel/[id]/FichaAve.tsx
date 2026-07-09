"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import Alert from "@/components/ui/Alert";
import Badge, { BIRD_STATUS_BADGE } from "@/components/ui/Badge";
import {
  ORIGEM_AVE_LABELS,
  SEXO_AVE_LABELS,
  STATUS_AVE_LABELS,
} from "@/lib/aves/labels";
import { useParentesCandidatos } from "@/lib/aves/useParentesCandidatos";
import { deleteAveAction, updateAveAction } from "@/lib/aves/actions";

interface Especie {
  id: string;
  nome: string;
}

interface AveDetalhe {
  id: string;
  nomeApelido: string | null;
  anilha: string;
  especieId: string;
  especie: Especie;
  mutacaoCor: string | null;
  sexo: keyof typeof SEXO_AVE_LABELS;
  dataNascimento: Date | string | null;
  origem: keyof typeof ORIGEM_AVE_LABELS;
  status: keyof typeof STATUS_AVE_LABELS;
  foto: string | null;
  registro: string | null;
  anilhaPaiId: string | null;
  paiAve: { id: string; nomeApelido: string | null; anilha: string } | null;
  anilhaMaeId: string | null;
  maeAve: { id: string; nomeApelido: string | null; anilha: string } | null;
}

const selectClass =
  "w-full box-border appearance-none font-sans text-[15px] px-4 py-3.5 rounded-[10px] border-[1.5px] border-input-border bg-white text-text-primary";

function formatarData(data: Date | string | null): string {
  if (!data) return "Não informado";
  const d = new Date(data);
  return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export default function FichaAve({
  ave,
  especies,
  emNinhada,
  mensagemSucesso = null,
}: {
  ave: AveDetalhe;
  especies: Especie[];
  emNinhada: boolean;
  mensagemSucesso?: string | null;
}) {
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <EdicaoAve
        ave={ave}
        especies={especies}
        onCancelar={() => setEditando(false)}
      />
    );
  }

  const statusLabel = STATUS_AVE_LABELS[ave.status];
  const badgeVariant = BIRD_STATUS_BADGE[statusLabel] ?? "neutral";

  return (
    <div className="max-w-[640px] mx-auto min-h-screen box-border pb-10">
      <div className="relative">
        {ave.foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ave.foto}
            alt={ave.nomeApelido ?? ave.anilha}
            className="w-full h-[220px] object-cover"
          />
        ) : (
          <div
            className="h-[220px] flex items-center justify-center text-background font-sans text-[13px]"
            style={{ background: "linear-gradient(135deg,#C9BB9A,#8B9D74)" }}
          >
            foto da ave
          </div>
        )}
        <Link
          href="/plantel"
          className="absolute top-4 left-4 w-[38px] h-[38px] rounded-full bg-white/90 flex items-center justify-center no-underline"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2B2A21" strokeWidth={2.2}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <button
          type="button"
          onClick={() => setEditando(true)}
          className="absolute top-4 right-4 w-[38px] h-[38px] rounded-full bg-white/90 flex items-center justify-center border-none cursor-pointer"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2B2A21" strokeWidth={2.2}>
            <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </button>
      </div>

      <div className="p-5">
        {mensagemSucesso && (
          <div className="mb-4">
            <Alert variant="success" title={mensagemSucesso} />
          </div>
        )}
        <div className="flex items-start justify-between">
          <div>
            <div className="font-serif font-semibold text-[28px] text-text-primary">
              {ave.nomeApelido || ave.anilha}
            </div>
            <div className="font-sans text-[13px] text-text-muted mt-0.5">
              {ave.especie.nome} · {SEXO_AVE_LABELS[ave.sexo]}
            </div>
          </div>
          <div className="flex gap-1.5 shrink-0">
            {emNinhada && <Badge variant="warning">Em ninhada</Badge>}
            <Badge variant={badgeVariant}>{statusLabel}</Badge>
          </div>
        </div>

        <div className="font-mono font-semibold text-[15px] text-oliva-600 bg-[#DCE5D2] inline-block px-3 py-1.5 rounded-lg mt-3">
          {ave.anilha}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <InfoCard label="Nascimento" valor={formatarData(ave.dataNascimento)} />
          <InfoCard label="Mutação / cor" valor={ave.mutacaoCor || "Não informado"} />
          <InfoCard
            label="Origem"
            valor={ORIGEM_AVE_LABELS[ave.origem]}
            className="col-span-2"
          />
          <InfoCard
            label="Registro (IBAMA)"
            valor={ave.registro || "Não informado"}
            className="col-span-2"
          />
        </div>

        <h2 className="font-serif font-semibold text-lg text-text-primary mt-6 mb-3">
          Genealogia
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <ParenteCard rotulo="Pai" ave={ave.paiAve} desconhecido="Desconhecido" />
          <ParenteCard rotulo="Mãe" ave={ave.maeAve} desconhecido="Desconhecida" />
        </div>
        <Link
          href={`/arvore/${ave.id}`}
          className="flex items-center justify-center gap-2 no-underline mt-2.5 font-sans font-bold text-sm text-oliva-600 border-[1.5px] border-oliva-600 rounded-[10px] p-3"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B5D3A" strokeWidth={2}>
            <circle cx="12" cy="5" r="2.5" />
            <circle cx="6" cy="19" r="2.5" />
            <circle cx="18" cy="19" r="2.5" />
            <path d="M12 7.5V13M12 13L6 16.5M12 13l6 3.5" />
          </svg>
          Ver árvore genealógica completa
        </Link>

        <div className="flex gap-3 mt-6">
          <Link
            href="/plantel"
            className="flex-1 text-center no-underline font-sans font-bold text-sm text-text-secondary border-[1.5px] border-border px-4 py-3.5 rounded-[10px]"
          >
            Voltar ao Plantel
          </Link>
          <Link
            href={`/plantel/${ave.id}/pedigree/cracha`}
            className="flex-1 text-center no-underline font-sans font-bold text-sm text-background bg-oliva-600 px-4 py-3.5 rounded-[10px]"
          >
            Gerar Crachá
          </Link>
          <Link
            href={`/plantel/${ave.id}/pedigree/download`}
            className="flex-1 text-center no-underline font-sans font-bold text-sm text-background bg-oliva-600 px-4 py-3.5 rounded-[10px]"
          >
            Gerar Certificado
          </Link>
        </div>

        <ExcluirAve aveId={ave.id} />
      </div>
    </div>
  );
}

function ExcluirAve({ aveId }: { aveId: string }) {
  const [confirmando, setConfirmando] = useState(false);
  const [state, formAction, pending] = useActionState(deleteAveAction, null);

  if (!confirmando) {
    return (
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          className="bg-transparent border-none font-sans font-bold text-[13px] text-terracota cursor-pointer p-2"
        >
          Excluir esta ave
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 bg-white border-[1.5px] border-terracota rounded-xl p-4 flex flex-col gap-3">
      <p className="font-sans text-sm text-text-primary m-0">
        Excluir esta ave remove o cadastro definitivamente. Para registrar
        óbito ou venda, use a edição de status. Tem certeza?
      </p>
      {state?.error && (
        <p className="text-sm font-semibold text-terracota m-0">
          {state.error}
        </p>
      )}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="tertiary"
          onClick={() => setConfirmando(false)}
          className="flex-1 !text-text-secondary"
        >
          Cancelar
        </Button>
        <form action={formAction} className="flex-1 flex">
          <input type="hidden" name="id" value={aveId} />
          <button
            type="submit"
            disabled={pending}
            className="flex-1 font-sans font-bold text-sm text-white bg-terracota border-none px-4 py-3 rounded-[10px] cursor-pointer disabled:opacity-60"
          >
            {pending ? "Excluindo..." : "Excluir definitivamente"}
          </button>
        </form>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  valor,
  className = "",
}: {
  label: string;
  valor: string;
  className?: string;
}) {
  return (
    <div className={`bg-white border border-border rounded-xl p-3.5 ${className}`}>
      <div className="font-sans font-bold text-[11px] tracking-[0.04em] uppercase text-text-muted">
        {label}
      </div>
      <div className="font-sans text-[15px] text-text-primary mt-1">{valor}</div>
    </div>
  );
}

function ParenteCard({
  rotulo,
  ave,
  desconhecido,
}: {
  rotulo: string;
  ave: { id: string; nomeApelido: string | null; anilha: string } | null;
  desconhecido: string;
}) {
  const conteudo = (
    <>
      <div className="w-[38px] h-[38px] rounded-[9px] bg-border shrink-0" />
      <div className="min-w-0">
        <div className="font-sans text-[11px] text-text-muted uppercase font-bold">
          {rotulo}
        </div>
        <div className="font-sans font-bold text-sm text-text-primary truncate">
          {ave ? ave.nomeApelido || ave.anilha : desconhecido}
        </div>
      </div>
    </>
  );

  if (!ave) {
    return (
      <div className="bg-white border border-border rounded-xl p-3.5 flex items-center gap-2.5">
        {conteudo}
      </div>
    );
  }

  return (
    <Link
      href={`/plantel/${ave.id}`}
      className="no-underline bg-white border border-border rounded-xl p-3.5 flex items-center gap-2.5"
    >
      {conteudo}
    </Link>
  );
}

function EdicaoAve({
  ave,
  especies,
  onCancelar,
}: {
  ave: AveDetalhe;
  especies: Especie[];
  onCancelar: () => void;
}) {
  const [state, formAction, pending] = useActionState(updateAveAction, null);
  const [especieId, setEspecieId] = useState(ave.especieId);
  const [sexo, setSexo] = useState(ave.sexo);
  const [origem, setOrigem] = useState(ave.origem);
  const [status, setStatus] = useState(ave.status);
  const [fotoPreview, setFotoPreview] = useState<string | null>(ave.foto);
  const { pais, maes } = useParentesCandidatos(especieId);

  const dataNascimentoValue =
    ave.dataNascimento && new Date(ave.dataNascimento).toISOString().slice(0, 10);

  function handleFotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) setFotoPreview(URL.createObjectURL(file));
  }

  return (
    <div className="max-w-[640px] mx-auto min-h-screen box-border">
      <div className="flex items-center gap-3.5 px-5 py-[18px] border-b border-border bg-background sticky top-0 z-[2]">
        <button
          type="button"
          onClick={onCancelar}
          className="w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2B2A21" strokeWidth={2.2}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="font-serif font-semibold text-xl text-text-primary">
          Editar {ave.nomeApelido || ave.anilha}
        </div>
      </div>

      <form action={formAction} className="p-5 flex flex-col gap-5">
        <input type="hidden" name="id" value={ave.id} />

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
          defaultValue={ave.nomeApelido ?? ""}
        />

        <div className="grid grid-cols-2 gap-3.5">
          <TextField name="anilha" label="Anilha" defaultValue={ave.anilha} required />
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
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <TextField
            name="mutacaoCor"
            label="Mutação / cor"
            defaultValue={ave.mutacaoCor ?? ""}
          />
          <TextField
            name="dataNascimento"
            label="Nascimento"
            type="date"
            defaultValue={dataNascimentoValue || ""}
          />
        </div>

        <TextField
          name="registro"
          label="Registro (IBAMA)"
          defaultValue={ave.registro ?? ""}
        />

        <div className="h-px bg-border" />

        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-[#4a4638]">
              Pai (machos da espécie selecionada no plantel)
            </label>
            <select name="anilhaPaiId" defaultValue={ave.anilhaPaiId ?? ""} className={selectClass}>
              <option value="">Nenhum / desconhecido</option>
              {pais.map((candidata) => (
                <option key={candidata.id} value={candidata.id}>
                  {candidata.nomeApelido || candidata.anilha} — {candidata.anilha}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-[#4a4638]">
              Mãe (fêmeas da espécie selecionada no plantel)
            </label>
            <select name="anilhaMaeId" defaultValue={ave.anilhaMaeId ?? ""} className={selectClass}>
              <option value="">Nenhuma / desconhecida</option>
              {maes.map((candidata) => (
                <option key={candidata.id} value={candidata.id}>
                  {candidata.nomeApelido || candidata.anilha} — {candidata.anilha}
                </option>
              ))}
            </select>
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

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-bold text-[#4a4638]">Status</label>
          <div className="flex gap-2 flex-wrap">
            {(
              Object.entries(STATUS_AVE_LABELS) as [
                keyof typeof STATUS_AVE_LABELS,
                string,
              ][]
            ).map(([valor, label]) => (
              <button
                key={valor}
                type="button"
                onClick={() => setStatus(valor)}
                className={`font-sans font-bold text-[13px] px-4 py-2.5 rounded-full ${
                  status === valor
                    ? "bg-oliva-600 text-background border-none"
                    : "bg-white text-text-secondary border-[1.5px] border-border"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <input type="hidden" name="status" value={status} />
        </div>

        {state?.error && (
          <p className="text-sm font-semibold text-terracota">{state.error}</p>
        )}

        <div className="flex gap-3 mt-2 pb-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancelar}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={pending} className="flex-1">
            {pending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </form>
    </div>
  );
}
