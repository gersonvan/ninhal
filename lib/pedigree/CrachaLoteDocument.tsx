import { Document, Page, View, StyleSheet } from "@react-pdf/renderer";
import type { DadosCracha } from "./service";
import { agruparEmPaginas } from "./service";
import { CartaoCracha } from "./CrachaDocument";

/**
 * Impressão em lote de Crachás: uma grade de 2 colunas x 4 linhas (8 cartões
 * de 10cm x 6cm por folha A4) — o melhor aproveitamento de papel para esse
 * tamanho de cartão (testado contra a alternativa em paisagem, que rende só
 * 6 por folha).
 *
 * As margens são apertadas de propósito: 2 cartões de 283.46pt + espaçamento
 * de 8pt + padding de 10pt por lado = 594.9pt, contra 595.28pt de largura do
 * A4. Um padding maior (ex: 24pt) faz a segunda coluna não caber e a grade
 * colapsar para 1 cartão por linha, desperdiçando metade de cada folha.
 */
export const CRACHAS_POR_PAGINA = 8;

const styles = StyleSheet.create({
  page: {
    padding: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "flex-start",
    gap: 8,
  },
});

export default function CrachaLoteDocument({ lote }: { lote: DadosCracha[] }) {
  const paginas = agruparEmPaginas(lote, CRACHAS_POR_PAGINA);

  return (
    <Document title="Crachas">
      {paginas.map((pagina, indice) => (
        <Page key={indice} size="A4" style={styles.page}>
          {pagina.map((dados) => (
            // wrap={false} impede o react-pdf de fatiar um cartão entre duas
            // páginas quando o layout transborda por qualquer motivo.
            <View key={dados.ave.anilha} wrap={false}>
              <CartaoCracha dados={dados} />
            </View>
          ))}
        </Page>
      ))}
    </Document>
  );
}
