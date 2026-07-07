export interface LinhaRevisaoIbama {
  linhaId: string;
  nomeApelido: string;
  nomeCientifico: string;
  anilha: string;
  especieId: string;
  sexo: "MACHO" | "FEMEA" | "NAO_SEXADO";
  dataNascimento: string;
  tipoAnilha: string;
  diametroAnilha: string;
  registro: string;
  origem: "NASCIDA_NO_CRIATORIO" | "ADQUIRIDA";
  anilhaPaiId: string;
  anilhaMaeId: string;
  duplicada: boolean;
  aveExistenteId: string | null;
}

export interface LinhaConfirmacaoIbama extends LinhaRevisaoIbama {
  /** Confirmação explícita do usuário para atualizar o registro existente (linhas duplicadas). */
  atualizarExistente: boolean;
}

export interface ResponsavelSugerido {
  nome: string | null;
  telefone: string | null;
}
