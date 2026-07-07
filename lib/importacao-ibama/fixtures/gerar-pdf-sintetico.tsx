import { Document, Page, renderToBuffer, StyleSheet, Text, View } from "@react-pdf/renderer";

/**
 * Gera, em memória, um PDF sintético reproduzindo a estrutura geral do
 * documento oficial "Relação de Passeriformes" do IBAMA (tabela de colunas
 * fixas + seção de identificação do responsável) — com dados fictícios,
 * usado apenas nos testes automatizados. Nunca usar `docs/relação de
 * aves.pdf` (dados pessoais reais) como fixture.
 */

export interface LinhaSinteticaIbama {
  numero: string;
  nomeCientifico: string;
  nomeComum: string;
  sexo: string;
  nascimento: string;
  tipoAnilha: string;
  diametro: string;
  anilha: string;
}

const styles = StyleSheet.create({
  page: { padding: 24, fontFamily: "Courier", fontSize: 9 },
  titulo: { fontSize: 12, marginBottom: 12 },
  linha: { flexDirection: "row" },
  cabecalho: { fontFamily: "Courier-Bold" },
  cel: { border: "1px solid #333", padding: 3 },
  celNumero: { width: 24 },
  celCientifico: { width: 140 },
  celComum: { width: 130 },
  celSexo: { width: 32 },
  celNascimento: { width: 70 },
  celTipoAnilha: { width: 70 },
  celDiametro: { width: 42 },
  celAnilha: { width: 90 },
  responsavel: { marginTop: 24, fontSize: 10 },
});

const CABECALHO: LinhaSinteticaIbama = {
  numero: "#",
  nomeCientifico: "Nome científico",
  nomeComum: "Nome comum",
  sexo: "Sexo",
  nascimento: "Nascimento",
  tipoAnilha: "Tipo anilha",
  diametro: "Diam.",
  anilha: "Código de anilha",
};

function LinhaTabela({
  linha,
  cabecalho = false,
}: {
  linha: LinhaSinteticaIbama;
  cabecalho?: boolean;
}) {
  return (
    <View style={[styles.linha, ...(cabecalho ? [styles.cabecalho] : [])]}>
      <Text style={[styles.cel, styles.celNumero]}>{linha.numero}</Text>
      <Text style={[styles.cel, styles.celCientifico]}>{linha.nomeCientifico}</Text>
      <Text style={[styles.cel, styles.celComum]}>{linha.nomeComum}</Text>
      <Text style={[styles.cel, styles.celSexo]}>{linha.sexo}</Text>
      <Text style={[styles.cel, styles.celNascimento]}>{linha.nascimento}</Text>
      <Text style={[styles.cel, styles.celTipoAnilha]}>{linha.tipoAnilha}</Text>
      <Text style={[styles.cel, styles.celDiametro]}>{linha.diametro}</Text>
      <Text style={[styles.cel, styles.celAnilha]}>{linha.anilha}</Text>
    </View>
  );
}

export interface DadosPdfSintetico {
  linhas: LinhaSinteticaIbama[];
  nomeResponsavel?: string;
  telefoneResponsavel?: string;
}

export async function gerarPdfSinteticoIbama(dados: DadosPdfSintetico): Promise<Buffer> {
  const documento = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.titulo}>Relação de Passeriformes (documento sintético de teste)</Text>
        <LinhaTabela linha={CABECALHO} cabecalho />
        {dados.linhas.map((linha) => (
          <LinhaTabela key={linha.numero} linha={linha} />
        ))}
        <View style={styles.responsavel}>
          {dados.nomeResponsavel && <Text>Nome do Criador: {dados.nomeResponsavel}</Text>}
          {dados.telefoneResponsavel && <Text>Telefone: {dados.telefoneResponsavel}</Text>}
        </View>
      </Page>
    </Document>
  );

  return renderToBuffer(documento);
}
