import type { ReactNode } from "react";

export type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "risk";

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-success-bg text-success-text",
  warning: "bg-warning-bg text-warning-text",
  danger: "bg-danger-bg text-danger-text",
  info: "bg-info-bg text-info-text",
  neutral: "bg-border text-text-secondary",
  risk: "bg-terracota text-white font-extrabold",
};

export interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
  dot?: boolean;
}

export default function Badge({ variant, children, dot = false }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-sans font-bold text-[11px] tracking-[0.04em] uppercase px-3 py-1.5 rounded-full ${variantClasses[variant]}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/**
 * Status de aves do plantel mapeados para as variantes de badge do design system.
 * "Fugiu" não possui estilo próprio em design/Design System.dc.html — reaproveita
 * a variante neutra usada para "Óbito" por ser o status terminal mais próximo.
 */
export const BIRD_STATUS_BADGE: Record<string, BadgeVariant> = {
  Ativo: "success",
  "Em ninhada": "warning",
  Vendido: "danger",
  Reservado: "info",
  Óbito: "neutral",
  Fugiu: "neutral",
};
