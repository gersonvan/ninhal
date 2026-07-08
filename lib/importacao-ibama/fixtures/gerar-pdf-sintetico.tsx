import { Document, Page, renderToBuffer, StyleSheet, Text, View } from "@react-pdf/renderer";

/**
 * Gera, em memória, um PDF sintético reproduzindo a estrutura de texto do
 * documento oficial "Relação de Passeriformes" do IBAMA (uma linha de texto
 * por ave, seguida da seção de identificação do responsável) — com dados
 * fictícios, usado apenas nos testes automatizados. Nunca usar `docs/relação
 * de aves.pdf` (dados pessoais reais) como fixture.
 *
 * A extração (`parser.ts`) lê o texto puro da página (`getText()`), não a
 * geometria de uma tabela — por isso esta fixture renderiza cada ave como
 * uma única linha de texto com valores separados por espaço, exatamente como
 * o texto bruto do documento real, em vez de uma grade de células com
 * largura fixa (que quebra de linha para valores mais longos e não reflete
 * o documento real, cujas colunas são largas o suficiente para não quebrar).
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
  identificacao: { marginBottom: 12 },
  cabecalho: { fontFamily: "Courier-Bold", marginBottom: 4 },
  linha: { marginBottom: 2 },
  responsavel: { marginTop: 24, fontSize: 10 },
});

function linhaTexto(linha: LinhaSinteticaIbama): string {
  return [
    linha.numero,
    linha.nomeCientifico,
    linha.nomeComum,
    linha.sexo,
    linha.nascimento,
    linha.tipoAnilha,
    linha.diametro,
    linha.anilha,
  ].join(" ");
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
        {(dados.nomeResponsavel || dados.telefoneResponsavel) && (
          <View style={styles.identificacao}>
            {dados.nomeResponsavel && (
              <Text>Nome: {dados.nomeResponsavel} CPF: 000.000.000-00 registro CTF: 0000000</Text>
            )}
            {dados.telefoneResponsavel && (
              <Text>Telefone: {dados.telefoneResponsavel} Fax: E-mail: teste@example.invalid</Text>
            )}
          </View>
        )}
        <Text style={styles.cabecalho}>
          # Nome científico Nome comum Sexo Nascimento Tipo anilha Diam. Código de anilha
        </Text>
        {dados.linhas.map((linha) => (
          <Text key={linha.numero} style={styles.linha}>
            {linhaTexto(linha)}
          </Text>
        ))}
        <Text style={styles.responsavel}>
          Observações: Esta relação é válida exclusivamente no território brasileiro, sem emendas ou
          rasuras. Não autoriza a exposição dos espécimes nela relacionados em logradouros públicos ou
          privados.
        </Text>
      </Page>
    </Document>
  );

  return renderToBuffer(documento);
}
