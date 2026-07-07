import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { NoArvore } from "@/lib/arvore/construir";
import type { DadosPedigree } from "./service";

export const CORES = {
  fundoPagina: "#DCD5C1",
  fundoCertificado: "#FBF8F0",
  bordaPrincipal: "#4B5D3A",
  bordaAcento: "#C97A2B",
  textoPrincipal: "#2B2A21",
  textoSecundario: "#6b6656",
  textoMuted: "#8a8578",
  bordaClara: "#E4DCC8",
  bordaInput: "#DDD5C2",
  geracao0Bg: "#DCE5D2",
  geracao0Texto: "#3C4A2F",
  ausenteBg: "#F7F3EA",
  ausenteTexto: "#a79e88",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: CORES.fundoPagina,
    padding: 24,
    fontFamily: "Helvetica",
  },
  certificado: {
    backgroundColor: CORES.fundoCertificado,
    padding: 36,
    borderWidth: 2,
    borderColor: CORES.bordaPrincipal,
    minHeight: 700,
  },
  certificadoInterno: {
    borderWidth: 1,
    borderColor: CORES.bordaAcento,
    padding: 24,
    flex: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: 18,
  },
  criatorioNome: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    letterSpacing: 2,
    color: CORES.textoPrincipal,
    marginTop: 6,
  },
  logoImagem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 4,
  },
  divisor: {
    width: 50,
    height: 1,
    backgroundColor: CORES.bordaAcento,
    marginVertical: 6,
  },
  tituloCertificado: {
    fontFamily: "Times-BoldItalic",
    fontSize: 24,
    color: CORES.textoPrincipal,
  },
  emitidoEm: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: CORES.textoMuted,
    marginTop: 4,
  },
  resumoAve: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    marginTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: CORES.bordaClara,
  },
  fotoAve: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  fotoPlaceholder: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: CORES.bordaClara,
  },
  nomeAve: {
    fontFamily: "Times-Bold",
    fontSize: 22,
    color: CORES.textoPrincipal,
  },
  especieAve: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: CORES.textoSecundario,
    marginTop: 2,
  },
  linhaCampos: {
    flexDirection: "row",
    gap: 18,
    marginTop: 10,
  },
  campoLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    letterSpacing: 0.5,
    color: CORES.textoMuted,
  },
  campoValor: {
    fontFamily: "Courier-Bold",
    fontSize: 10,
    color: CORES.textoPrincipal,
    marginTop: 2,
  },
  arvore: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
    flex: 1,
  },
  colunaGeracao0: {
    width: 110,
    justifyContent: "center",
  },
  cartaoGeracao0: {
    backgroundColor: CORES.geracao0Bg,
    borderWidth: 1.5,
    borderColor: CORES.bordaPrincipal,
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
  },
  colunaPais: {
    width: 110,
    justifyContent: "space-around",
    gap: 8,
  },
  cartaoConhecido: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: CORES.bordaInput,
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
  },
  colunaAvos: {
    flex: 1,
    justifyContent: "space-around",
    gap: 6,
  },
  cartaoAusente: {
    backgroundColor: CORES.ausenteBg,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: CORES.bordaInput,
    borderRadius: 6,
    padding: 7,
    alignItems: "center",
  },
  rotuloRelacao: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    letterSpacing: 0.5,
    color: CORES.textoMuted,
    textTransform: "uppercase",
  },
  nomeAncestral: {
    fontFamily: "Times-Bold",
    fontSize: 11,
    color: CORES.textoPrincipal,
    marginTop: 2,
  },
  anilhaAncestral: {
    fontFamily: "Courier",
    fontSize: 8,
    color: CORES.textoSecundario,
    marginTop: 1,
  },
  labelAusente: {
    fontFamily: "Helvetica",
    fontSize: 8,
    color: CORES.ausenteTexto,
    marginTop: 2,
  },
  rodape: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: CORES.bordaClara,
  },
  responsavelNome: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: CORES.textoPrincipal,
  },
  responsavelCargo: {
    fontFamily: "Helvetica",
    fontSize: 8,
    color: CORES.textoMuted,
    marginTop: 1,
  },
  seloAutenticado: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: CORES.bordaAcento,
    alignItems: "center",
    justifyContent: "center",
  },
  seloTexto: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6,
    color: "#8B5A24",
    textTransform: "uppercase",
  },
  codigoLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    letterSpacing: 0.5,
    color: CORES.textoMuted,
    textTransform: "uppercase",
  },
  codigoValor: {
    fontFamily: "Courier-Bold",
    fontSize: 11,
    color: CORES.textoPrincipal,
  },
});

function CartaoAncestral({ relacao, no }: { relacao: string; no: NoArvore }) {
  if (!no.conhecido) {
    return (
      <View style={styles.cartaoAusente}>
        <Text style={styles.rotuloRelacao}>{relacao}</Text>
        <Text style={styles.labelAusente}>{no.label}</Text>
      </View>
    );
  }
  return (
    <View style={styles.cartaoConhecido}>
      <Text style={styles.rotuloRelacao}>{relacao}</Text>
      <Text style={styles.nomeAncestral}>{no.nomeApelido || no.anilha}</Text>
      <Text style={styles.anilhaAncestral}>{no.anilha}</Text>
    </View>
  );
}

export default function PedigreeDocument({ dados }: { dados: DadosPedigree }) {
  const nomeAveExibicao = dados.ave.nomeApelido || dados.ave.anilha;

  return (
    <Document title={`Pedigree - ${nomeAveExibicao}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.certificado}>
          <View style={styles.certificadoInterno}>
            <View style={styles.header}>
              {dados.criatorioLogoUrl ? (
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image src={dados.criatorioLogoUrl} style={styles.logoImagem} />
              ) : null}
              <Text style={styles.criatorioNome}>
                {dados.criatorioNome.toUpperCase()}
              </Text>
              <View style={styles.divisor} />
              <Text style={styles.tituloCertificado}>Certificado de Pedigree</Text>
              <Text style={styles.emitidoEm}>
                Registro genealógico emitido em {dados.emitidoEmLabel}
              </Text>
            </View>

            <View style={styles.resumoAve}>
              {dados.ave.fotoUrl ? (
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image src={dados.ave.fotoUrl} style={styles.fotoAve} />
              ) : (
                <View style={styles.fotoPlaceholder} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.nomeAve}>{nomeAveExibicao}</Text>
                <Text style={styles.especieAve}>
                  {dados.ave.especieNome}
                  {dados.ave.mutacaoCor ? ` · Mutação ${dados.ave.mutacaoCor}` : ""} ·{" "}
                  {dados.ave.sexoLabel}
                </Text>
                <View style={styles.linhaCampos}>
                  <View>
                    <Text style={styles.campoLabel}>ANILHA</Text>
                    <Text style={styles.campoValor}>{dados.ave.anilha}</Text>
                  </View>
                  <View>
                    <Text style={styles.campoLabel}>NASCIMENTO</Text>
                    <Text style={styles.campoValor}>
                      {dados.ave.dataNascimentoLabel}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.campoLabel}>ORIGEM</Text>
                    <Text style={styles.campoValor}>{dados.ave.origemLabel}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.arvore}>
              <View style={styles.colunaGeracao0}>
                <View style={styles.cartaoGeracao0}>
                  <Text style={[styles.rotuloRelacao, { color: CORES.geracao0Texto }]}>
                    Geração 0
                  </Text>
                  <Text style={styles.nomeAncestral}>{nomeAveExibicao}</Text>
                  <Text style={styles.anilhaAncestral}>{dados.ave.anilha}</Text>
                </View>
              </View>

              <View style={styles.colunaPais}>
                <CartaoAncestral relacao="Pai" no={dados.arvore.pai} />
                <CartaoAncestral relacao="Mãe" no={dados.arvore.mae} />
              </View>

              <View style={styles.colunaAvos}>
                <CartaoAncestral relacao="Avô paterno" no={dados.arvore.paiDoPai} />
                <CartaoAncestral relacao="Avó paterna" no={dados.arvore.maeDoPai} />
                <CartaoAncestral relacao="Avô materno" no={dados.arvore.paiDaMae} />
                <CartaoAncestral relacao="Avó materna" no={dados.arvore.maeDaMae} />
              </View>
            </View>

            <View style={styles.rodape}>
              <View>
                <Text style={styles.responsavelNome}>{dados.responsavelNome}</Text>
                <Text style={styles.responsavelCargo}>
                  Responsável técnico · {dados.criatorioNome}
                </Text>
              </View>
              <View style={styles.seloAutenticado}>
                <Text style={styles.seloTexto}>Autenticado</Text>
              </View>
              <View>
                <Text style={styles.codigoLabel}>Código de verificação</Text>
                <Text style={styles.codigoValor}>{dados.codigoVerificacao}</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
