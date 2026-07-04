import Link from "next/link";
import type { NoArvore, ArvoreGenealogica } from "@/lib/arvore/construir";

interface Especie {
  nome: string;
}

interface AveDetalhe {
  id: string;
  nomeApelido: string | null;
  anilha: string;
  especie: Especie;
}

interface NinhadaAtiva {
  id: string;
  codNinhada: string;
  coeficienteParentesco: number;
  macho: { id: string; nomeApelido: string | null; anilha: string };
  femea: { id: string; nomeApelido: string | null; anilha: string };
}

function simboloSexo(sexo: string): string {
  if (sexo === "MACHO") return "♂";
  if (sexo === "FEMEA") return "♀";
  return "";
}

function nomeAve(ave: { nomeApelido: string | null; anilha: string }): string {
  return ave.nomeApelido || ave.anilha;
}

function CardAncestral({ no }: { no: NoArvore }) {
  if (!no.conhecido) {
    return (
      <div className="border-[1.5px] border-dashed border-input-border rounded-xl p-3 text-center text-text-muted font-sans text-xs">
        {no.label}
      </div>
    );
  }

  return (
    <Link
      href={`/arvore/${no.id}`}
      className="no-underline bg-white border-[1.5px] border-border rounded-2xl p-4 flex flex-col items-center gap-1.5 relative"
    >
      <div
        className="w-[52px] h-[52px] rounded-full"
        style={{ background: "linear-gradient(135deg,#E4DCC8,#C9BB9A)" }}
      />
      <div className="font-serif font-semibold text-base text-text-primary">
        {nomeAve(no)}
      </div>
      <div className="font-mono text-[11px] text-text-muted">{no.anilha}</div>
      {simboloSexo(no.sexo) && (
        <span className="absolute top-2.5 right-2.5 text-base">
          {simboloSexo(no.sexo)}
        </span>
      )}
    </Link>
  );
}

export default function ArvoreView({
  ave,
  arvore,
  ninhadaAtiva,
}: {
  ave: AveDetalhe;
  arvore: ArvoreGenealogica;
  ninhadaAtiva: NinhadaAtiva | null;
}) {
  return (
    <div className="max-w-[760px] mx-auto px-5 pt-5 pb-8">
      <div className="font-serif font-semibold text-2xl text-text-primary">
        Árvore genealógica
      </div>
      <div className="font-sans text-[13px] text-text-muted mt-0.5 mb-4">
        Linhagem de {nomeAve(ave)} · {ave.especie.nome}
      </div>

      <div className="font-sans font-bold text-[11px] tracking-[0.06em] uppercase text-text-muted text-center mb-3">
        Avós
      </div>
      <div className="grid grid-cols-4 gap-2.5 mb-2">
        <CardAncestral no={arvore.paiDoPai} />
        <CardAncestral no={arvore.maeDoPai} />
        <CardAncestral no={arvore.paiDaMae} />
        <CardAncestral no={arvore.maeDaMae} />
      </div>

      <div className="flex justify-center mb-0.5">
        <div className="w-1/4 border-r-[1.5px] border-input-border h-4" />
        <div className="w-1/4 border-l-[1.5px] border-input-border h-4" />
        <div className="w-1/4 border-r-[1.5px] border-input-border h-4" />
        <div className="w-1/4 border-l-[1.5px] border-input-border h-4" />
      </div>

      <div className="font-sans font-bold text-[11px] tracking-[0.06em] uppercase text-text-muted text-center mb-3">
        Pais
      </div>
      <div className="grid grid-cols-2 gap-3.5 mb-2">
        <CardAncestral no={arvore.pai} />
        <CardAncestral no={arvore.mae} />
      </div>

      <div className="flex justify-center">
        <div className="w-[1.5px] h-6 bg-input-border" />
      </div>

      <div className="font-sans font-bold text-[11px] tracking-[0.06em] uppercase text-[#8B6A2F] text-center mb-3">
        Ave selecionada
      </div>
      <div className="flex justify-center mb-2">
        <Link
          href={`/plantel/${ave.id}`}
          className="no-underline w-[220px] bg-success-bg border-2 border-oliva-600 rounded-2xl p-4.5 flex flex-col items-center gap-1.5 relative"
        >
          <div
            className="w-16 h-16 rounded-full"
            style={{ background: "linear-gradient(135deg,#E4DCC8,#C9BB9A)" }}
          />
          <div className="font-serif font-semibold text-lg text-text-primary">
            {nomeAve(ave)}
          </div>
          <div className="font-mono text-[11px] text-success-text">
            {ave.anilha}
          </div>
        </Link>
      </div>

      {ninhadaAtiva && (
        <div className="mt-7 border-t-[1.5px] border-dashed border-ambar pt-5">
          <div className="flex items-center gap-2 justify-center mb-3.5">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8B5A24"
              strokeWidth={2}
            >
              <path d="M12 2L1 21h22L12 2z" />
              <path d="M12 9v5M12 17h.01" />
            </svg>
            <div className="font-sans font-extrabold text-[13px] text-[#6B3E17] uppercase tracking-[0.03em]">
              Ninhada #{ninhadaAtiva.codNinhada} em andamento
            </div>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Link
              href={`/plantel/${ninhadaAtiva.femea.id}`}
              className="no-underline bg-white border-[1.5px] border-oliva-600 rounded-xl px-4 py-3 flex items-center gap-2"
            >
              <div className="w-[30px] h-[30px] rounded-full bg-border" />
              <span className="font-sans font-bold text-[13px] text-text-primary">
                {nomeAve(ninhadaAtiva.femea)}
              </span>
            </Link>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#B3423A"
              strokeWidth={2.4}
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
            <Link
              href={`/plantel/${ninhadaAtiva.macho.id}`}
              className="no-underline bg-white border-[1.5px] border-terracota rounded-xl px-4 py-3 flex items-center gap-2"
            >
              <div className="w-[30px] h-[30px] rounded-full bg-border" />
              <span className="font-sans font-bold text-[13px] text-text-primary">
                {nomeAve(ninhadaAtiva.macho)}
              </span>
            </Link>
          </div>
          <div className="text-center font-sans text-[12.5px] text-[#6B3E17] mt-2.5 max-w-[420px] mx-auto leading-normal">
            Coeficiente de parentesco {ninhadaAtiva.coeficienteParentesco}% —
            recomendamos revisar antes de confirmar os filhotes desta ninhada.
          </div>
          <div className="flex justify-center mt-3.5">
            <Link
              href={`/ninhadas/${ninhadaAtiva.id}`}
              className="no-underline font-sans font-bold text-[13.5px] text-white bg-terracota px-5 py-2.5 rounded-[10px]"
            >
              Ver ninhada #{ninhadaAtiva.codNinhada}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
