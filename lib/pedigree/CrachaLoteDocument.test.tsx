import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { Page, renderToBuffer } from "@react-pdf/renderer";
import CrachaLoteDocument, { CRACHAS_POR_PAGINA } from "./CrachaLoteDocument";
import type { DadosCracha } from "./service";

/** Mesma técnica de inspeção estrutural usada em CrachaDocument.test.tsx e
 * PedigreeDocument.test.tsx — sem renderizar via react-pdf/renderer. */
function extrairTextos(no: ReactNode): string[] {
  if (no === null || no === undefined || typeof no === "boolean") return [];
  if (typeof no === "string" || typeof no === "number") return [String(no)];
  if (Array.isArray(no)) return no.flatMap(extrairTextos);
  if (typeof no === "object" && "type" in no && "props" in no) {
    if (typeof no.type === "function") {
      const componente = no.type as (props: unknown) => ReactNode;
      return extrairTextos(componente(no.props));
    }
    const filhos = (no.props as { children?: ReactNode }).children;
    return extrairTextos(filhos);
  }
  return [];
}

/** Conta quantos elementos `<Page>` aparecem na árvore, sem renderizar o PDF. */
function contarPaginas(no: ReactNode): number {
  if (no === null || no === undefined || typeof no === "boolean") return 0;
  if (typeof no === "string" || typeof no === "number") return 0;
  if (Array.isArray(no)) return no.reduce((soma, item) => soma + contarPaginas(item), 0);
  if (typeof no === "object" && "type" in no && "props" in no) {
    const props = no.props as { children?: ReactNode };
    if (no.type === Page) {
      return 1 + contarPaginas(props.children);
    }
    return contarPaginas(props.children);
  }
  return 0;
}

function aveDeTeste(sufixo: string): DadosCracha {
  return {
    ave: {
      nomeApelido: `Ave ${sufixo}`,
      anilha: `BR-2024-${sufixo}`,
      especieNome: "Canário Belga",
      mutacaoCor: null,
      sexoLabel: "Macho",
      dataNascimentoLabel: "Não informado",
      origemLabel: "Adquirida",
      fotoUrl: null,
      registro: null,
    },
    criatorioNome: "Aviário Serra Verde",
    responsavelNome: "Carlos Menezes",
    responsavelTelefone: null,
  };
}

describe("CrachaLoteDocument", () => {
  it("gera uma única página quando o lote cabe nela", () => {
    const lote = [aveDeTeste("001"), aveDeTeste("002")];
    const documento = CrachaLoteDocument({ lote });

    expect(contarPaginas(documento)).toBe(1);
  });

  it(`divide em várias páginas quando o lote passa de ${CRACHAS_POR_PAGINA} aves`, () => {
    const lote = Array.from({ length: CRACHAS_POR_PAGINA + 3 }, (_, i) =>
      aveDeTeste(String(i).padStart(3, "0")),
    );
    const documento = CrachaLoteDocument({ lote });

    expect(contarPaginas(documento)).toBe(2);
  });

  it("inclui os dados de identificação de todas as aves do lote", () => {
    const lote = [aveDeTeste("001"), aveDeTeste("002"), aveDeTeste("003")];
    const texto = extrairTextos(CrachaLoteDocument({ lote })).join(" ");

    expect(texto).toContain("Ave 001");
    expect(texto).toContain("BR-2024-001");
    expect(texto).toContain("Ave 002");
    expect(texto).toContain("BR-2024-002");
    expect(texto).toContain("Ave 003");
    expect(texto).toContain("BR-2024-003");
  });

  it(`renderiza ${CRACHAS_POR_PAGINA} crachás em exatamente 1 página física do PDF (grade 2x4 sem transbordar)`, async () => {
    // Regressão: com margens largas demais a segunda coluna não cabia nos
    // 21cm do A4, a grade colapsava para 1 cartão por linha e o react-pdf
    // criava páginas físicas extras, fatiando cartões na virada de página.
    // A contagem de "/Type /Page" no PDF real detecta esse transbordo, que a
    // inspeção estrutural de elementos <Page> não enxerga.
    const lote = Array.from({ length: CRACHAS_POR_PAGINA }, (_, i) =>
      aveDeTeste(String(i).padStart(3, "0")),
    );
    const buffer = await renderToBuffer(CrachaLoteDocument({ lote }));

    const paginasFisicas =
      buffer.toString("latin1").match(/\/Type\s*\/Page[^s]/g)?.length ?? 0;
    expect(paginasFisicas).toBe(1);
  });
});
