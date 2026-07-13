import { Document, Page, View, StyleSheet } from "@react-pdf/renderer";
import type { DadosCracha } from "./service";
import { agruparEmPaginas } from "./service";
import { CartaoCracha } from "./CrachaDocument";

/**
 * Impressão em lote de Crachás: uma grade de 2 colunas x 4 linhas (8 cartões
 * de 10cm x 6cm por folha A4) — o melhor aproveitamento de papel para esse
 * tamanho de cartão (testado contra a alternativa em paisagem, que rende só
 * 6 por folha).
 */
export const CRACHAS_POR_PAGINA = 8;

const styles = StyleSheet.create({
  page: {
    padding: 24,
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "flex-start",
    gap: 14,
  },
});

export default function CrachaLoteDocument({ lote }: { lote: DadosCracha[] }) {
  const paginas = agruparEmPaginas(lote, CRACHAS_POR_PAGINA);

  return (
    <Document title="Crachas">
      {paginas.map((pagina, indice) => (
        <Page key={indice} size="A4" style={styles.page}>
          {pagina.map((dados) => (
            <View key={dados.ave.anilha}>
              <CartaoCracha dados={dados} />
            </View>
          ))}
        </Page>
      ))}
    </Document>
  );
}
