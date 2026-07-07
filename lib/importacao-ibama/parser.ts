import { PDFParse, type TableArray } from "pdf-parse";

export interface AveExtraidaIbama {
  numero: string;
  nomeCientifico: string;
  nomeComum: string;
  sexo: "MACHO" | "FEMEA" | "NAO_SEXADO";
  dataNascimento: Date | null;
  tipoAnilha: string;
  diametroAnilha: string;
  anilha: string;
}

export interface LinhaComErro {
  linha: string;
  motivo: string;
}

export interface ResponsavelExtraido {
  nome: string | null;
  telefone: string | null;
}

export interface ResultadoExtracaoIbama {
  aves: AveExtraidaIbama[];
  linhasComErro: LinhaComErro[];
  responsavel: ResponsavelExtraido;
}

const NUMERO_COLUNAS = 8;

/**
 * Extrai aves e a identificação do responsável do PDF oficial "Relação de
 * Passeriformes" do IBAMA. A extração é por posição de coluna (via detecção
 * geométrica de tabelas do `pdf-parse`), não por OCR — o leiaute pode variar
 * entre versões do documento, então linhas que não seguem a estrutura
 * esperada são reportadas em `linhasComErro` em vez de interromper a
 * extração (a defesa principal contra erro é a revisão manual, Task 2.4).
 */
export async function extrairDadosIbama(buffer: Buffer): Promise<ResultadoExtracaoIbama> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    // Chamadas sequenciais (não em paralelo): rodar getText/getTable
    // concorrentemente na mesma instância do parser trava o worker interno
    // do pdf.js (confirmado empiricamente durante o desenvolvimento).
    const textoResultado = await parser.getText();
    const tabelaResultado = await parser.getTable();

    const linhas = tabelaResultado.pages.flatMap((pagina) =>
      pagina.tables.flatMap((tabela) => tabela),
    );

    return {
      ...extrairAves(linhas),
      responsavel: extrairResponsavel(textoResultado.text),
    };
  } finally {
    await parser.destroy();
  }
}

function extrairAves(linhas: TableArray): {
  aves: AveExtraidaIbama[];
  linhasComErro: LinhaComErro[];
} {
  const aves: AveExtraidaIbama[] = [];
  const linhasComErro: LinhaComErro[] = [];

  for (const celulas of linhas) {
    const numero = celulas[0]?.trim() ?? "";
    // Linhas de cabeçalho ("#", "Nome científico", ...) não têm número na
    // primeira coluna — ignoradas silenciosamente, não são um erro de dado.
    if (!/^\d+$/.test(numero)) continue;

    const resultado = parseLinhaAve(celulas);
    if ("erro" in resultado) {
      linhasComErro.push({ linha: celulas.join(" | "), motivo: resultado.erro });
    } else {
      aves.push(resultado.ave);
    }
  }

  return { aves, linhasComErro };
}

/**
 * Normaliza o texto de uma célula extraída via `getTable()`. O `pdf-parse`
 * insere um hífen literal seguido de quebra de linha ("-\n") quando um valor
 * sem espaço natural no ponto de quebra (ex: um código de anilha longo) é
 * dividido entre duas linhas dentro da célula — esse hífen não faz parte do
 * valor original e precisa ser removido sem deixar espaço no lugar
 * (reconstituindo a palavra partida). Já uma quebra de linha em um espaço
 * natural (ex: "SISPASS 2.6\nCE/A 004802") vira um espaço único, como antes.
 * Um hífen legítimo do valor original (ex: "Galo-da-campina") nunca é
 * seguido de quebra de linha imediatamente, então é preservado.
 */
function normalizarCelula(celula: string): string {
  return celula
    .trim()
    .replace(/-\n/g, "")
    .replace(/\s+/g, " ");
}

function parseLinhaAve(celulas: string[]): { ave: AveExtraidaIbama } | { erro: string } {
  if (celulas.length !== NUMERO_COLUNAS) {
    return {
      erro: `Esperado ${NUMERO_COLUNAS} colunas (#, Nome científico, Nome comum, Sexo, Nascimento, Tipo anilha, Diam., Código de anilha), encontrado ${celulas.length}.`,
    };
  }

  // Nomes longos podem quebrar em mais de uma linha dentro da célula (largura
  // de coluna variável entre versões do documento) — normaliza para espaço único.
  const [numero, nomeCientifico, nomeComum, sexoRaw, nascimentoRaw, tipoAnilha, diametroAnilha, anilha] =
    celulas.map(normalizarCelula);

  const sexo = mapearSexo(sexoRaw);
  if (!sexo) {
    return { erro: `Valor de sexo inválido: "${sexoRaw}" (esperado M, F ou I).` };
  }

  if (!anilha) {
    return { erro: "Código de anilha ausente." };
  }

  return {
    ave: {
      numero,
      nomeCientifico,
      nomeComum,
      sexo,
      dataNascimento: parseData(nascimentoRaw),
      tipoAnilha,
      diametroAnilha,
      anilha,
    },
  };
}

function mapearSexo(valor: string): "MACHO" | "FEMEA" | "NAO_SEXADO" | null {
  const normalizado = valor.trim().toUpperCase();
  if (normalizado === "M") return "MACHO";
  if (normalizado === "F") return "FEMEA";
  if (normalizado === "I") return "NAO_SEXADO";
  return null;
}

/** Formato esperado: DD/MM/AAAA. Retorna null (em vez de lançar) se não bater com o padrão. */
function parseData(valor: string): Date | null {
  const match = valor.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, dia, mes, ano] = match;
  const data = new Date(Date.UTC(Number(ano), Number(mes) - 1, Number(dia)));
  return Number.isNaN(data.getTime()) ? null : data;
}

/**
 * A seção de identificação do responsável vem como texto livre (não
 * tabular), separada da tabela de aves. Captura apenas nome e telefone —
 * CPF e endereço não são extraídos por decisão explícita de escopo.
 */
function extrairResponsavel(texto: string): ResponsavelExtraido {
  const nomeMatch = texto.match(/Nome do Criador:[ \t]*([^\n]+)/i);
  const telefoneMatch = texto.match(/Telefone:[ \t]*([^\n]+)/i);

  return {
    nome: nomeMatch ? nomeMatch[1].trim() : null,
    telefone: telefoneMatch ? telefoneMatch[1].trim() : null,
  };
}
