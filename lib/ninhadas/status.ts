import type { BadgeVariant } from "@/components/ui/Badge";

export interface NinhadaComoStatus {
  filhotesNascidos: number | null;
  coeficienteParentesco?: number;
}

export interface StatusNinhada {
  label: string;
  variant: BadgeVariant;
}

/**
 * Status calculado da ninhada (não é um campo armazenado):
 * - "Encerrada" quando `filhotesNascidos` foi preenchido (definição operacional da Task 3.1/3.5).
 * - "Risco genético" quando a preferência de alerta do tenant está ativa e há parentesco detectado.
 * - "Em curso" caso contrário.
 */
export function determinarStatusNinhada(
  ninhada: NinhadaComoStatus,
  alertasAtivados: boolean,
): StatusNinhada {
  if (ninhada.filhotesNascidos != null) {
    return { label: "Encerrada", variant: "neutral" };
  }
  if (alertasAtivados && (ninhada.coeficienteParentesco ?? 0) > 0) {
    return { label: "Risco genético", variant: "risk" };
  }
  return { label: "Em curso", variant: "warning" };
}
