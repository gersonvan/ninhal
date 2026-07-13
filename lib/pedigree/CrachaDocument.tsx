import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { DadosCracha } from "./service";
import { CORES } from "./PedigreeDocument";

/** Crachá: cartão compacto de identificação, tamanho carteira/cartão (10cm x 6cm). */
export const PT_POR_CM = 28.3464567;
export const LARGURA_CRACHA = 10 * PT_POR_CM;
export const ALTURA_CRACHA = 6 * PT_POR_CM;

const styles = StyleSheet.create({
  cartao: {
    width: LARGURA_CRACHA,
    height: ALTURA_CRACHA,
    backgroundColor: CORES.fundoCertificado,
    borderWidth: 1.5,
    borderColor: CORES.bordaPrincipal,
    padding: 10,
    fontFamily: "Helvetica",
  },
  corpo: {
    flexDirection: "row",
    gap: 10,
    flex: 1,
  },
  colunaFoto: {
    width: 76,
    alignItems: "center",
  },
  foto: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  fotoPlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: CORES.bordaClara,
  },
  anilhaBadge: {
    marginTop: 6,
    fontFamily: "Courier-Bold",
    fontSize: 7,
    color: CORES.textoPrincipal,
    textAlign: "center",
  },
  colunaPrincipal: {
    flex: 1,
    justifyContent: "center",
  },
  nomeAve: {
    fontFamily: "Times-Bold",
    fontSize: 15,
    color: CORES.textoPrincipal,
  },
  especieAve: {
    fontFamily: "Helvetica",
    fontSize: 7.5,
    color: CORES.textoSecundario,
    marginTop: 2,
  },
  linhaCampos: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  campoLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 5.5,
    letterSpacing: 0.3,
    color: CORES.textoMuted,
    textTransform: "uppercase",
  },
  campoValor: {
    fontFamily: "Courier-Bold",
    fontSize: 8,
    color: CORES.textoPrincipal,
    marginTop: 1,
  },
  rodape: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: CORES.bordaClara,
  },
  responsavelNome: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6,
    color: CORES.textoPrincipal,
  },
  responsavelInfo: {
    fontFamily: "Helvetica",
    fontSize: 5,
    color: CORES.textoMuted,
    marginTop: 1,
  },
  criatorioNome: {
    fontFamily: "Helvetica-Bold",
    fontSize: 5,
    letterSpacing: 0.3,
    color: CORES.textoSecundario,
    textTransform: "uppercase",
  },
});

/**
 * Conteúdo visual do Crachá (cartão 10cm x 6cm), sem o `<Page>` que o
 * envolve — reutilizado tanto pelo Crachá individual (`CrachaDocument`)
 * quanto pela impressão em lote (`CrachaLoteDocument`, vários cartões por
 * página A4).
 */
export function CartaoCracha({ dados }: { dados: DadosCracha }) {
  const nomeAveExibicao = dados.ave.nomeApelido || dados.ave.anilha;

  return (
    <View style={styles.cartao}>
      <View style={styles.corpo}>
        <View style={styles.colunaFoto}>
          {dados.ave.fotoUrl ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={dados.ave.fotoUrl} style={styles.foto} />
          ) : (
            <View style={styles.fotoPlaceholder} />
          )}
          <Text style={styles.anilhaBadge}>{dados.ave.anilha}</Text>
        </View>

        <View style={styles.colunaPrincipal}>
          <Text style={styles.nomeAve}>{nomeAveExibicao}</Text>
          <Text style={styles.especieAve}>
            {dados.ave.especieNome} · {dados.ave.sexoLabel}
          </Text>

          <View style={styles.linhaCampos}>
            <View>
              <Text style={styles.campoLabel}>Nascimento</Text>
              <Text style={styles.campoValor}>{dados.ave.dataNascimentoLabel}</Text>
            </View>
            <View>
              <Text style={styles.campoLabel}>Registro</Text>
              <Text style={styles.campoValor}>
                {dados.ave.registro || "Não informado"}
              </Text>
            </View>
            <View>
              <Text style={styles.campoLabel}>Mutação / cor</Text>
              <Text style={styles.campoValor}>
                {dados.ave.mutacaoCor || "Não informado"}
              </Text>
            </View>
            <View>
              <Text style={styles.campoLabel}>Origem</Text>
              <Text style={styles.campoValor}>{dados.ave.origemLabel}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.rodape}>
        <View>
          <Text style={styles.responsavelNome}>{dados.responsavelNome}</Text>
          <Text style={styles.responsavelInfo}>
            {dados.responsavelTelefone || "Telefone não informado"}
          </Text>
        </View>
        <Text style={styles.criatorioNome}>{dados.criatorioNome}</Text>
      </View>
    </View>
  );
}

export default function CrachaDocument({ dados }: { dados: DadosCracha }) {
  const nomeAveExibicao = dados.ave.nomeApelido || dados.ave.anilha;

  return (
    <Document title={`Cracha - ${nomeAveExibicao}`}>
      <Page size={[LARGURA_CRACHA, ALTURA_CRACHA]}>
        <CartaoCracha dados={dados} />
      </Page>
    </Document>
  );
}
