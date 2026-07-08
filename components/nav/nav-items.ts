import {
  ArvoreIcon,
  ConfiguracoesIcon,
  HomeIcon,
  NinhadasIcon,
  PlantelIcon,
} from "./icons";

export type NavIcon = typeof HomeIcon;

export interface NavItem {
  label: string;
  href: string;
  icon: NavIcon;
}

/** Itens da sidebar (desktop), na ordem de design/03 Dashboard.dc.html. */
export const SIDEBAR_ITEMS: NavItem[] = [
  { label: "Início", href: "/dashboard", icon: HomeIcon },
  { label: "Plantel", href: "/plantel", icon: PlantelIcon },
  { label: "Ninhadas", href: "/ninhadas", icon: NinhadasIcon },
  { label: "Árvore", href: "/arvore", icon: ArvoreIcon },
  { label: "Configurações", href: "/configuracoes", icon: ConfiguracoesIcon },
];

/**
 * Itens da navegação inferior (mobile), baseados em design/03 Dashboard.dc.html.
 * "Árvore" foi acrescentada ao design original: sem ela, a genealogia ficava
 * inacessível pela navegação no celular — o principal contexto de uso.
 */
export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { label: "Início", href: "/dashboard", icon: HomeIcon },
  { label: "Plantel", href: "/plantel", icon: PlantelIcon },
  { label: "Ninhadas", href: "/ninhadas", icon: NinhadasIcon },
  { label: "Árvore", href: "/arvore", icon: ArvoreIcon },
  { label: "Configurações", href: "/configuracoes", icon: ConfiguracoesIcon },
];

export const NEW_BIRD_HREF = "/plantel/novo";
