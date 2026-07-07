"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import Alert from "@/components/ui/Alert";
import { useParentesCandidatos } from "@/lib/aves/useParentesCandidatos";
import {
  confirmarImportacaoAction,
  processarPdfIbamaAction,
  type ConfirmarImportacaoState,
  type LinhaConfirmacaoIbama,
  type LinhaRevisaoIbama,
  type ResponsavelSugerido,
} from "@/lib/importacao-ibama/actions";

interface Especie {
  id: string;
  nome: string;
}

const selectClass =
  "w-full box-border appearance-none font-sans text-sm px-3 py-2.5 rounded-lg border-[1.5px] border-input-border bg-white text-text-primary";

export default function ImportarIbamaView({ especies }: { especies: Especie[] }) {
  const [uploadState, uploadAction, uploadPending] = useActionState(
    processarPdfIbamaAction,
    null,
  );
  const [linhas, setLinhas] = useState<LinhaConfirmacaoIbama[] | null>(null);
  const [linhasComErro, setLinhasComErro] = useState<
    { linha: string; motivo: string }[]
  >([]);
  const [responsavelSugerido, setResponsavelSugerido] =
    useState<ResponsavelSugerido | null>(null);
  const [confirmarNome, setConfirmarNome] = useState(false);
  const [confirmarTelefone, setConfirmarTelefone] = useState(false);

  const [confirmando, startConfirmacao] = useTransition();
  const [resultado, setResultado] = useState<ConfirmarImportacaoState>(null);

  // Assim que o processamento do PDF retorna com sucesso, inicializa o
  // estado editável da revisão (uma única vez, a partir da resposta do servidor).
  if (uploadState && "linhas" in uploadState && linhas === null) {
    setLinhas(
      uploadState.linhas.map((linha) => ({ ...linha, atualizarExistente: false })),
    );
    setLinhasComErro(uploadState.linhasComErro);
    setResponsavelSugerido(uploadState.responsavelSugerido);
  }

  function atualizarLinha(linhaId: string, patch: Partial<LinhaConfirmacaoIbama>) {
    setLinhas((atual) =>
      atual ? atual.map((l) => (l.linhaId === linhaId ? { ...l, ...patch } : l)) : atual,
    );
  }

  function handleConfirmar() {
    if (!linhas) return;
    startConfirmacao(async () => {
      const resposta = await confirmarImportacaoAction({
        linhas,
        responsavel:
          confirmarNome || confirmarTelefone
            ? {
                nome: confirmarNome ? responsavelSugerido?.nome ?? undefined : undefined,
                telefone: confirmarTelefone
                  ? responsavelSugerido?.telefone ?? undefined
                  : undefined,
              }
            : null,
      });
      setResultado(resposta);
    });
  }

  if (resultado && "success" in resultado) {
    return (
      <div className="max-w-[720px] mx-auto px-5 pt-5 pb-8 flex flex-col gap-5">
        <h1 className="font-serif font-semibold text-2xl text-text-primary m-0">
          Importação do IBAMA
        </h1>
        <Alert
          variant="success"
          title="Importação concluída"
          description={`${resultado.criadas} ave(s) cadastrada(s), ${resultado.atualizadas} atualizada(s)${
            resultado.ignoradas > 0
              ? `, ${resultado.ignoradas} ignorada(s) por duplicidade não confirmada`
              : ""
          }.`}
        />
        <Link
          href="/plantel"
          className="no-underline font-sans font-bold text-sm text-background bg-oliva-600 px-4 py-3.5 rounded-[10px] text-center"
        >
          Ver plantel
        </Link>
      </div>
    );
  }

  if (linhas === null) {
    return (
      <div className="max-w-[640px] mx-auto px-5 pt-5 pb-8 flex flex-col gap-5">
        <h1 className="font-serif font-semibold text-2xl text-text-primary m-0">
          Importação do IBAMA
        </h1>
        <p className="font-sans text-sm text-text-secondary m-0 leading-normal">
          Envie o PDF da Relação de Passeriformes emitida pelo IBAMA (SISPASS/CTF)
          para importar seu plantel automaticamente. Você poderá revisar e corrigir
          cada ave antes de confirmar.
        </p>
        <form action={uploadAction} className="flex flex-col gap-4">
          <input
            type="file"
            name="arquivo"
            accept="application/pdf"
            required
            className="font-sans text-sm"
          />
          {uploadState && "error" in uploadState && (
            <p className="text-sm font-semibold text-terracota m-0">
              {uploadState.error}
            </p>
          )}
          <Button type="submit" disabled={uploadPending}>
            {uploadPending ? "Processando..." : "Processar PDF"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-[720px] mx-auto px-5 pt-5 pb-8 flex flex-col gap-5">
      <h1 className="font-serif font-semibold text-2xl text-text-primary m-0">
        Revisar importação
      </h1>
      <p className="font-sans text-sm text-text-secondary m-0">
        Confira e corrija os dados extraídos antes de confirmar — nada é salvo no
        plantel até você clicar em &quot;Confirmar importação&quot;.
      </p>

      {linhasComErro.length > 0 && (
        <Alert
          variant="warning"
          title={`${linhasComErro.length} linha(s) do PDF não puderam ser lidas automaticamente`}
          description="Essas linhas foram ignoradas e precisam ser cadastradas manualmente."
        />
      )}

      {responsavelSugerido && (responsavelSugerido.nome || responsavelSugerido.telefone) && (
        <div className="bg-surface border border-border rounded-[14px] p-[18px] flex flex-col gap-3">
          <div className="font-sans font-bold text-sm text-text-primary">
            Dados do responsável encontrados no documento
          </div>
          {responsavelSugerido.nome && (
            <label className="flex items-center gap-2.5 font-sans text-sm text-text-primary">
              <input
                type="checkbox"
                checked={confirmarNome}
                onChange={(e) => setConfirmarNome(e.target.checked)}
              />
              Atualizar meu nome para &quot;{responsavelSugerido.nome}&quot;
            </label>
          )}
          {responsavelSugerido.telefone && (
            <label className="flex items-center gap-2.5 font-sans text-sm text-text-primary">
              <input
                type="checkbox"
                checked={confirmarTelefone}
                onChange={(e) => setConfirmarTelefone(e.target.checked)}
              />
              Atualizar telefone do criatório para &quot;{responsavelSugerido.telefone}&quot;
            </label>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {linhas.map((linha, indice) => (
          <LinhaRevisaoCard
            key={linha.linhaId}
            linha={linha}
            indice={indice}
            especies={especies}
            onChange={(patch) => atualizarLinha(linha.linhaId, patch)}
          />
        ))}
      </div>

      {resultado && "error" in resultado && (
        <p className="text-sm font-semibold text-terracota m-0">{resultado.error}</p>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={() => setLinhas(null)}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          className="flex-1"
          disabled={confirmando}
          onClick={handleConfirmar}
        >
          {confirmando ? "Confirmando..." : "Confirmar importação"}
        </Button>
      </div>
    </div>
  );
}

function LinhaRevisaoCard({
  linha,
  indice,
  especies,
  onChange,
}: {
  linha: LinhaConfirmacaoIbama;
  indice: number;
  especies: Especie[];
  onChange: (patch: Partial<LinhaRevisaoIbama & { atualizarExistente: boolean }>) => void;
}) {
  const { pais, maes } = useParentesCandidatos(linha.especieId);

  return (
    <div className="bg-surface border border-border rounded-[14px] p-[18px] flex flex-col gap-3.5">
      <div className="font-sans font-bold text-[11px] tracking-[0.06em] uppercase text-text-muted">
        Ave {indice + 1}
      </div>

      {linha.duplicada && (
        <Alert
          variant="warning"
          title="Anilha já cadastrada no seu plantel"
          description="Você pode atualizar o registro existente com os dados deste documento, ou deixar como está (esta linha será ignorada)."
          action={
            <label className="flex items-center gap-2 font-sans text-[13px] font-bold text-[#6B3E17] whitespace-nowrap">
              <input
                type="checkbox"
                checked={linha.atualizarExistente}
                onChange={(e) => onChange({ atualizarExistente: e.target.checked })}
              />
              Atualizar
            </label>
          }
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Nome/apelido"
          value={linha.nomeApelido}
          onChange={(e) => onChange({ nomeApelido: e.target.value })}
        />
        <TextField
          label="Anilha"
          value={linha.anilha}
          onChange={(e) => onChange({ anilha: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-bold text-[#4a4638]">Espécie</label>
          <select
            value={linha.especieId}
            onChange={(e) => onChange({ especieId: e.target.value })}
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
                onClick={() => onChange({ sexo: opcao.value })}
                className={`flex-1 py-2 rounded-lg font-sans font-bold text-xs cursor-pointer ${
                  linha.sexo === opcao.value
                    ? "bg-oliva-600 text-background"
                    : "bg-transparent text-text-secondary"
                }`}
              >
                {opcao.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Nascimento"
          type="date"
          value={linha.dataNascimento}
          onChange={(e) => onChange({ dataNascimento: e.target.value })}
        />
        <TextField
          label="Registro (IBAMA)"
          value={linha.registro}
          onChange={(e) => onChange({ registro: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Nome científico"
          value={linha.nomeCientifico}
          onChange={(e) => onChange({ nomeCientifico: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Tipo anilha"
            value={linha.tipoAnilha}
            onChange={(e) => onChange({ tipoAnilha: e.target.value })}
          />
          <TextField
            label="Diâmetro"
            value={linha.diametroAnilha}
            onChange={(e) => onChange({ diametroAnilha: e.target.value })}
          />
        </div>
      </div>

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
              onClick={() => onChange({ origem: opcao.value })}
              className={`flex-1 py-2.5 rounded-lg font-sans font-bold text-[13px] cursor-pointer ${
                linha.origem === opcao.value
                  ? "bg-oliva-600 text-background"
                  : "bg-transparent text-text-secondary"
              }`}
            >
              {opcao.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-border" />

      <p className="font-sans text-[12.5px] text-text-secondary m-0">
        A seleção de pai e mãe é restrita a aves já cadastradas no seu plantel —
        nunca outra ave desta mesma importação.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-bold text-[#4a4638]">Pai</label>
          <select
            value={linha.anilhaPaiId}
            onChange={(e) => onChange({ anilhaPaiId: e.target.value })}
            className={selectClass}
          >
            <option value="">Nenhum / desconhecido</option>
            {pais.map((ave) => (
              <option key={ave.id} value={ave.id}>
                {ave.nomeApelido || ave.anilha} — {ave.anilha}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-bold text-[#4a4638]">Mãe</label>
          <select
            value={linha.anilhaMaeId}
            onChange={(e) => onChange({ anilhaMaeId: e.target.value })}
            className={selectClass}
          >
            <option value="">Nenhuma / desconhecida</option>
            {maes.map((ave) => (
              <option key={ave.id} value={ave.id}>
                {ave.nomeApelido || ave.anilha} — {ave.anilha}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
