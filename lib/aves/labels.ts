import type { OrigemAve, SexoAve, StatusAve } from "@/app/generated/prisma/client";

export const STATUS_AVE_LABELS: Record<StatusAve, string> = {
  ATIVO: "Ativo",
  RESERVADO: "Reservado",
  VENDIDO: "Vendido",
  OBITO: "Óbito",
  FUGIU: "Fugiu",
};

export const SEXO_AVE_LABELS: Record<SexoAve, string> = {
  MACHO: "Macho",
  FEMEA: "Fêmea",
  NAO_SEXADO: "Não sexado",
};

export const ORIGEM_AVE_LABELS: Record<OrigemAve, string> = {
  NASCIDA_NO_CRIATORIO: "Nascida no criatório",
  ADQUIRIDA: "Adquirida",
};
