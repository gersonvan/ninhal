"use client";

import { useState } from "react";
import Link from "next/link";
import type { NoArvore } from "@/lib/arvore/construir";
import type { DadosPedigree } from "@/lib/pedigree/service";

function nomeAncestral(no: NoArvore): { titulo: string; subtitulo: string } {
  if (no.conhecido) {
    return { titulo: no.nomeApelido || no.anilha, subtitulo: no.anilha };
  }
  return { titulo: no.label, subtitulo: "" };
}

function CartaoPai({ rotulo, no }: { rotulo: string; no: NoArvore }) {
  const { titulo, subtitulo } = nomeAncestral(no);
  return (
    <div className="bg-white border border-input-border rounded-[10px] p-3 text-center">
      <div className="font-sans font-bold text-[9px] tracking-[0.05em] uppercase text-text-muted">
        {rotulo}
      </div>
      <div className="font-serif font-semibold text-sm text-text-primary mt-0.5">
        {titulo}
      </div>
      {subtitulo && (
        <div className="font-mono text-[10px] text-text-secondary">{subtitulo}</div>
      )}
    </div>
  );
}

function CartaoAvo({ rotulo, no }: { rotulo: string; no: NoArvore }) {
  const { titulo } = nomeAncestral(no);
  return (
    <div className="bg-background border border-dashed border-input-border rounded-lg p-2 text-center">
      <div className="font-sans text-[9px] tracking-[0.05em] uppercase text-text-muted">
        {rotulo}
      </div>
      <div className="font-sans text-xs text-text-muted mt-0.5">{titulo}</div>
    </div>
  );
}

function MenuExportar({ aveId }: { aveId: string }) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAberto((atual) => !atual)}
        className="font-sans font-bold text-[13px] bg-oliva-600 text-background px-4 py-2.5 rounded-lg cursor-pointer flex items-center gap-1.5"
      >
        Exportar
      </button>
      {aberto && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-10 bg-white border border-border rounded-lg shadow-lg overflow-hidden min-w-[180px]">
          <a
            href={`/plantel/${aveId}/pedigree/download`}
            className="no-underline block font-sans font-bold text-[13px] text-text-primary px-4 py-3 border-b border-border-subtle hover:bg-background"
          >
            Certificado
          </a>
          <a
            href={`/plantel/${aveId}/pedigree/cracha`}
            className="no-underline block font-sans font-bold text-[13px] text-text-primary px-4 py-3 hover:bg-background"
          >
            Crachá
          </a>
        </div>
      )}
    </div>
  );
}

export default function ExportarPedigreeView({
  aveId,
  dados,
}: {
  aveId: string;
  dados: DadosPedigree;
}) {
  const nomeAve = dados.ave.nomeApelido || dados.ave.anilha;

  return (
    <div
      className="min-h-screen flex flex-col items-center gap-5 px-4 py-8"
      style={{ background: "#DCD5C1" }}
    >
      <div className="w-full max-w-[820px] flex items-center justify-between">
        <Link
          href={`/plantel/${aveId}`}
          className="no-underline font-sans font-bold text-sm text-oliva-600 flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B5D3A" strokeWidth={2.2}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Voltar
        </Link>
        <div className="font-serif font-semibold text-xl text-text-primary">
          Origem
        </div>
        <MenuExportar aveId={aveId} />
      </div>

      <div
        className="w-full max-w-[820px] relative"
        style={{
          background: "#FBF8F0",
          boxShadow: "0 30px 70px -20px rgba(43,42,33,0.35)",
        }}
      >
        <div
          className="m-[22px] p-8 flex flex-col gap-5"
          style={{ border: "2px solid #4B5D3A" }}
        >
          <div
            className="p-6 flex flex-col gap-5"
            style={{ border: "1px solid #C97A2B" }}
          >
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="w-[52px] h-[52px] rounded-full border-[1.5px] border-oliva-600 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4B5D3A" strokeWidth={1.6}>
                  <path d="M12 3c-3 2-5 5-5 9a5 5 0 0010 0c0-4-2-7-5-9z" />
                  <path d="M12 12v9" />
                  <path d="M8 21h8" />
                </svg>
              </div>
              <div className="font-sans font-extrabold text-[13px] tracking-[0.2em] uppercase text-text-primary">
                {dados.criatorioNome}
              </div>
              <div className="w-[60px] h-px" style={{ background: "#C97A2B" }} />
              <div className="font-serif italic font-semibold text-[28px] text-text-primary">
                Certificado de Pedigree
              </div>
              <div className="font-sans text-xs text-text-muted">
                Registro genealógico emitido em {dados.emitidoEmLabel}
              </div>
            </div>

            <div className="flex gap-6 items-center pb-5 border-b border-border">
              {dados.ave.fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={dados.ave.fotoUrl}
                  alt={nomeAve}
                  className="w-[88px] h-[88px] rounded-full object-cover shrink-0"
                  style={{ boxShadow: "0 0 0 1.5px #C97A2B" }}
                />
              ) : (
                <div
                  className="w-[88px] h-[88px] rounded-full shrink-0"
                  style={{
                    background: "linear-gradient(135deg,#E4DCC8,#C9BB9A)",
                    boxShadow: "0 0 0 1.5px #C97A2B",
                  }}
                />
              )}
              <div className="flex-1">
                <div className="font-serif font-semibold text-[26px] text-text-primary">
                  {nomeAve}
                </div>
                <div className="font-sans text-[13px] text-text-secondary mt-0.5">
                  {dados.ave.especieNome}
                  {dados.ave.mutacaoCor ? ` · Mutação ${dados.ave.mutacaoCor}` : ""} ·{" "}
                  {dados.ave.sexoLabel}
                </div>
                <div className="flex gap-5 mt-3">
                  <div>
                    <div className="font-sans font-bold text-[10px] uppercase text-text-muted">
                      Anilha
                    </div>
                    <div className="font-mono font-bold text-sm text-text-primary">
                      {dados.ave.anilha}
                    </div>
                  </div>
                  <div>
                    <div className="font-sans font-bold text-[10px] uppercase text-text-muted">
                      Nascimento
                    </div>
                    <div className="font-sans font-bold text-sm text-text-primary">
                      {dados.ave.dataNascimentoLabel}
                    </div>
                  </div>
                  <div>
                    <div className="font-sans font-bold text-[10px] uppercase text-text-muted">
                      Origem
                    </div>
                    <div className="font-sans font-bold text-sm text-text-primary">
                      {dados.ave.origemLabel}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-[130px] shrink-0 flex flex-col justify-center">
                <div className="bg-success-bg border-[1.5px] border-oliva-600 rounded-[10px] p-3 text-center">
                  <div className="font-sans font-bold text-[9px] uppercase text-success-text">
                    Geração 0
                  </div>
                  <div className="font-serif font-semibold text-sm text-text-primary mt-0.5">
                    {nomeAve}
                  </div>
                  <div className="font-mono text-[10px] text-text-secondary">
                    {dados.ave.anilha}
                  </div>
                </div>
              </div>
              <div className="w-[130px] shrink-0 flex flex-col justify-around gap-2">
                <CartaoPai rotulo="Pai" no={dados.arvore.pai} />
                <CartaoPai rotulo="Mãe" no={dados.arvore.mae} />
              </div>
              <div className="flex-1 flex flex-col justify-around gap-1.5">
                <CartaoAvo rotulo="Avô paterno" no={dados.arvore.paiDoPai} />
                <CartaoAvo rotulo="Avó paterna" no={dados.arvore.maeDoPai} />
                <CartaoAvo rotulo="Avô materno" no={dados.arvore.paiDaMae} />
                <CartaoAvo rotulo="Avó materna" no={dados.arvore.maeDaMae} />
              </div>
            </div>

            <div className="flex items-end justify-between pt-5 border-t border-border">
              <div>
                <div className="w-[150px] border-b border-text-primary h-6 mb-1.5" />
                <div className="font-sans font-bold text-xs text-text-primary">
                  {dados.responsavelNome}
                </div>
                <div className="font-sans text-[11px] text-text-muted">
                  Responsável técnico · {dados.criatorioNome}
                </div>
              </div>
              <div
                className="w-[70px] h-[70px] rounded-full border-2 flex flex-col items-center justify-center shrink-0"
                style={{ borderColor: "#C97A2B", transform: "rotate(-8deg)" }}
              >
                <div className="font-sans text-[7px] tracking-[0.1em] text-[#8B5A24]">
                  AUTENTICADO
                </div>
              </div>
              <div className="text-right">
                <div className="font-sans font-bold text-[10px] uppercase text-text-muted">
                  Código de verificação
                </div>
                <div className="font-mono font-bold text-sm text-text-primary">
                  {dados.codigoVerificacao}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="font-sans text-xs text-text-secondary text-center max-w-[500px]">
        Este pedigree é gerado automaticamente a partir dos registros do seu
        plantel e pode ser compartilhado como PDF ou imagem com quem adquirir o
        filhote.
      </p>
    </div>
  );
}
