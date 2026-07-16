import { z } from "zod";

export const SEXO_AVE_VALUES = ["MACHO", "FEMEA", "NAO_SEXADO"] as const;
export const ORIGEM_AVE_VALUES = ["NASCIDA_NO_CRIATORIO", "ADQUIRIDA"] as const;
export const STATUS_AVE_VALUES = [
  "ATIVO",
  "RESERVADO",
  "VENDIDO",
  "OBITO",
  "FUGIU",
] as const;

export const createAveSchema = z.object({
  anilha: z.string().trim().min(1),
  nomeApelido: z.string().trim().min(1).optional(),
  especieId: z.string().trim().min(1),
  mutacaoCor: z.string().trim().min(1).optional(),
  sexo: z.enum(SEXO_AVE_VALUES),
  dataNascimento: z.coerce.date().optional(),
  origem: z.enum(ORIGEM_AVE_VALUES),
  // Só relevante quando origem = ADQUIRIDA — preenchido opcionalmente pelo usuário.
  origemDetalhe: z.string().trim().min(1).optional(),
  anilhaPaiId: z.string().trim().min(1).optional(),
  anilhaMaeId: z.string().trim().min(1).optional(),
  status: z.enum(STATUS_AVE_VALUES).optional(),
  foto: z.string().trim().url().optional(),
  // Número de registro do criador/plantel junto ao IBAMA — preenchido manualmente pelo usuário.
  registro: z.string().trim().min(1).optional(),
  // Preenchidos pela importação da Relação de Passeriformes do IBAMA (Task 2.4).
  nomeCientifico: z.string().trim().min(1).optional(),
  tipoAnilha: z.string().trim().min(1).optional(),
  diametroAnilha: z.string().trim().min(1).optional(),
});

export const updateAveSchema = createAveSchema.partial();

export type CreateAveInput = z.infer<typeof createAveSchema>;
export type UpdateAveInput = z.infer<typeof updateAveSchema>;
