import "./pdf-polyfills";
import { PDFParse } from "pdf-parse";

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

/**
 * Limite de comprimento acima do qual um valor de anilha sem espaço interno é
 * tratado como possivelmente truncado (ver `pareceTruncada` abaixo) — ver
 * achado da Task 2.5 / correção da Task 2.6.
 */
const LIMITE_SUSPEITO_ANILHA = 20;

/**
 * Casa uma linha de dados da tabela a partir do texto puro da página (ver
 * nota abaixo sobre por que não usamos a detecção geométrica de tabela do
 * `pdf-parse`). Âncoras estruturais fortes: o sexo é sempre um único
 * caractere/token isolado (validado separadamente por `mapearSexo`, para
 * produzir um erro específico em vez de rejeitar a linha inteira na
 * estrutura — mas o regex ainda exige que seja um token de um só caractere,
 * senão a captura não-gulosa anterior consumiria colunas demais); o diâmetro
 * (padrão N,N) nunca varia de formato. O trecho entre o número da linha e o
 * sexo é "Nome científico" + "Nome comum" combinados; o trecho entre o sexo e
 * o diâmetro é "Nascimento" + "Tipo anilha" combinados (a data em si não é
 * usada como âncora — um formato inesperado não deve impedir o
 * reconhecimento das demais colunas, `parseData` trata a conversão à parte);
 * o resto da linha é o Código de anilha (pode ficar vazio, validado à parte).
 */
const LINHA_REGEX =
  /^(\d+)\s+(.+?)\s+(\S)\s+(\S+)\s+(.+?)\s+(\d+,\d+)\s*(.*)$/;

/**
 * Extrai aves e a identificação do responsável do PDF oficial "Relação de
 * Passeriformes" do IBAMA, a partir do texto puro da página (`getText()`),
 * não da detecção geométrica de tabela do `pdf-parse` (`getTable()`).
 *
 * Descoberto por verificação manual contra o documento real: `getTable()`
 * fragmenta a tabela real do IBAMA em dezenas de "tabelas" de 1-4 linhas
 * cada (provavelmente por causa do sombreamento alternado entre linhas, que
 * confunde a detecção de bordas geométrica), fazendo com que só uma fração
 * das linhas reais fosse reconhecida como parte de uma tabela válida de 8
 * colunas — na prática, isso derrubava uma relação de 23 aves para pouco
 * mais de 10. O texto puro da página, por outro lado, preserva cada ave em
 * uma linha de texto completa e bem formada, então analisamos essas linhas
 * diretamente por posição de âncoras confiáveis (sexo, data), sem depender
 * da geometria de células. O leiaute pode variar entre versões do
 * documento; linhas que não seguem a estrutura esperada são reportadas em
 * `linhasComErro` em vez de interromper a extração (a defesa principal
 * contra erro é a revisão manual, Task 2.4).
 */
export async function extrairDadosIbama(buffer: Buffer): Promise<ResultadoExtracaoIbama> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const textoResultado = await parser.getText();
    return {
      ...extrairAves(textoResultado.text),
      responsavel: extrairResponsavel(textoResultado.text),
    };
  } finally {
    await parser.destroy();
  }
}

/**
 * Uma linha de ave muito longa (nome científico de 3 palavras + código de
 * anilha longo, por exemplo) pode ultrapassar a largura da página e quebrar
 * em uma linha de texto adicional dentro do mesmo parágrafo — a quebra cai
 * no meio da linha de dados, não necessariamente em um espaço "seguro", e a
 * parte após a quebra não começa com um número, então uma divisão ingênua
 * por `\n` a descarta silenciosamente (achado confirmado empiricamente).
 * Em vez de dividir por quebra de linha física, localizamos o início de
 * cada linha de ave pela sequência numérica estritamente crescente a partir
 * de 1 (1, 2, 3, ...) seguida de uma palavra iniciada por maiúscula (começo
 * do nome científico) — uma âncora que não depende de onde o texto quebrou.
 */
function dividirEmLinhasDeAve(textoCompleto: string): string[] {
  // O pdf-parse insere marcadores de página ("-- 1 of 2 --") entre o texto
  // de páginas diferentes ao concatenar via getText() — não fazem parte do
  // conteúdo do documento e precisam ser removidos antes de qualquer coisa,
  // senão podem ser capturados junto com a última linha de uma página.
  const textoSemMarcadores = textoCompleto.replace(/--\s*\d+\s*of\s*\d+\s*--/gi, " ");
  const textoAchatado = textoSemMarcadores.replace(/\s*\n\s*/g, " ");
  // Exclui dígitos imediatamente precedidos por ",", "." ou outro dígito —
  // evita colidir com a parte fracionária do "Diam." (ex: "2,6 SISPASS...")
  // ou com um número de versão embutido no próprio código de anilha (ex:
  // "SISPASS 2.6 CE/A..." — o "6" após o ponto fica seguido de espaço e uma
  // palavra maiúscula, coincidindo com o início real da próxima linha;
  // achados empíricos contra o documento real do IBAMA).
  const marcador = /(?<![,.\d])\b(\d+)\s+(?=[A-ZÀ-Ý])/g;

  const posicoes: number[] = [];
  let proximoEsperado = 1;
  let m: RegExpExecArray | null;
  while ((m = marcador.exec(textoAchatado))) {
    if (Number(m[1]) === proximoEsperado) {
      posicoes.push(m.index);
      proximoEsperado += 1;
    }
  }

  // A última linha da ave em cada página não tem uma próxima posição de
  // corte natural DENTRO da mesma página — a "próxima posição" encontrada
  // (se houver) já está na página seguinte, com todo o rodapé/cabeçalho de
  // página no meio do caminho (achado empírico: o texto entre elas incluía
  // o bloco de "Observações"/identificação do responsável repetido na
  // página seguinte). Por isso, o limite de cada linha é sempre o *menor*
  // entre: a próxima posição de linha encontrada, o início do primeiro
  // rótulo de rodapé conhecido ("Observações:"/"Atenção:") e um teto de
  // caracteres como rede de segurança caso o rótulo varie entre versões.
  const RODAPE_REGEX = /\b(Observações|Atenção)\s*:/i;
  const LIMITE_LINHA = 220;

  return posicoes.map((inicio, i) => {
    const limitePorPosicao = i + 1 < posicoes.length ? posicoes[i + 1] : textoAchatado.length;
    const trecho = textoAchatado.slice(inicio, Math.min(limitePorPosicao, inicio + LIMITE_LINHA));
    const rodape = trecho.match(RODAPE_REGEX);
    const fim = rodape ? rodape.index! : trecho.length;
    return trecho.slice(0, fim).trim();
  });
}

function extrairAves(texto: string): {
  aves: AveExtraidaIbama[];
  linhasComErro: LinhaComErro[];
} {
  const aves: AveExtraidaIbama[] = [];
  const linhasComErro: LinhaComErro[] = [];

  for (const linhaLimpa of dividirEmLinhasDeAve(texto)) {
    const resultado = parseLinhaAve(linhaLimpa);
    if ("erro" in resultado) {
      linhasComErro.push({ linha: linhaLimpa, motivo: resultado.erro });
    } else {
      aves.push(resultado.ave);
    }
  }

  return { aves, linhasComErro };
}

/**
 * Detecta perda silenciosa de caracteres: confirmado empiricamente (Task 2.6)
 * que, para um trecho de texto sem nenhum espaço interno que excede a largura
 * da célula, o PDF pode ser renderizado sem os caracteres excedentes — sem
 * quebra de linha, sem hífen, sem qualquer marcador. Não há como recuperar os
 * caracteres perdidos nem distinguir com certeza um valor genuinamente longo
 * de um valor truncado apenas pelo texto extraído — a defesa aqui é
 * heurística: um valor sem espaço interno com comprimento acima do limite
 * observado é tratado como suspeito e a linha é reportada para revisão
 * manual em vez de aceita silenciosamente.
 */
function pareceTruncada(valor: string): boolean {
  // >= (não >): o valor truncado sempre sai com exatamente
  // LIMITE_SUSPEITO_ANILHA caracteres (é o próprio ponto de corte) — um
  // valor genuíno de exatamente esse comprimento é indistinguível de um
  // valor truncado a partir desse ponto, então também é tratado como
  // suspeito por precaução (defesa deliberadamente conservadora).
  return valor.length >= LIMITE_SUSPEITO_ANILHA && !/\s/.test(valor);
}

function parseLinhaAve(linha: string): { ave: AveExtraidaIbama } | { erro: string } {
  const match = linha.match(LINHA_REGEX);
  if (!match) {
    return {
      erro: "Não foi possível reconhecer as 8 colunas esperadas (#, Nome científico, Nome comum, Sexo, Nascimento, Tipo anilha, Diam., Código de anilha) nesta linha.",
    };
  }

  const [, numero, nomeCombinado, sexoRaw, nascimentoRaw, tipoAnilha, diametroAnilha, anilha] = match;

  // "Nome comum" é sempre o último token do trecho combinado (pode ser um
  // único nome hifenizado, ex: "Galo-da-campina"); "Nome científico" é o
  // restante (2-3 palavras, ex: "Oryzoborus maximiliani maximiliani").
  const tokensNome = nomeCombinado.trim().split(/\s+/);
  const nomeComum = tokensNome[tokensNome.length - 1] ?? "";
  const nomeCientifico = tokensNome.slice(0, -1).join(" ");

  if (!nomeCientifico || !nomeComum) {
    return { erro: `Não foi possível separar nome científico e nome comum em "${nomeCombinado}".` };
  }

  const sexo = mapearSexo(sexoRaw);
  if (!sexo) {
    return { erro: `Valor de sexo inválido: "${sexoRaw}" (esperado M, F ou I).` };
  }

  const anilhaLimpa = anilha.trim();
  if (!anilhaLimpa) {
    return { erro: "Código de anilha ausente." };
  }

  if (pareceTruncada(anilhaLimpa)) {
    return {
      erro: `Código de anilha "${anilhaLimpa}" pode estar truncado (mais de ${LIMITE_SUSPEITO_ANILHA} caracteres sem espaço) — confira o valor no documento original antes de cadastrar manualmente.`,
    };
  }

  return {
    ave: {
      numero,
      nomeCientifico,
      nomeComum,
      sexo,
      dataNascimento: parseData(nascimentoRaw),
      tipoAnilha: tipoAnilha.trim(),
      diametroAnilha: diametroAnilha.trim(),
      anilha: anilhaLimpa,
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
 *
 * No documento real, "Nome:" e "Telefone:" aparecem na mesma linha que
 * outros campos (ex: "Nome: DAVI ... CPF: ...", "Telefone: ... Fax: ...
 * E-mail: ..."), não em linhas próprias — por isso os padrões abaixo param
 * no próximo rótulo de campo conhecido, em vez de ir até a quebra de linha.
 */
function extrairResponsavel(texto: string): ResponsavelExtraido {
  const nomeMatch = texto.match(/\bNome:\s*(.+?)\s+CPF:/i);
  const telefoneMatch = texto.match(/\bTelefone:\s*(.+?)\s+Fax:/i);

  return {
    nome: nomeMatch ? nomeMatch[1].trim() : null,
    telefone: telefoneMatch ? telefoneMatch[1].trim() : null,
  };
}
