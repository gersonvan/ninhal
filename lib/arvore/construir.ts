/**
 * Montagem pura da árvore genealógica de 3 gerações (a própria ave, pais, avós) a
 * partir de um nó já aninhado (ver lib/arvore/service.ts para a busca no banco,
 * reaproveitando o mesmo padrão de include de lib/parentesco/service.ts).
 *
 * Ancestrais ausentes são rotulados de duas formas distintas:
 * - "Não registrado/a": a referência simplesmente nunca foi vinculada no cadastro.
 * - "Adquirido/a — sem registro": o ancestral mais próximo conhecido tem
 *   origem = Adquirida, então seus próprios pais nunca existirão no sistema por
 *   definição (a ave veio de fora do criatório) — a distinção comunica ao usuário
 *   a razão da ausência, em vez de sugerir um cadastro pendente.
 */

export type OrigemAve = "NASCIDA_NO_CRIATORIO" | "ADQUIRIDA";

export interface AveAncestralNode {
  id: string;
  nomeApelido: string | null;
  anilha: string;
  sexo: string;
  origem: OrigemAve;
  paiAve?: AveAncestralNode | null;
  maeAve?: AveAncestralNode | null;
}

export interface NoArvoreConhecido {
  conhecido: true;
  id: string;
  nomeApelido: string | null;
  anilha: string;
  sexo: string;
  origem: OrigemAve;
}

export interface NoArvoreAusente {
  conhecido: false;
  motivo: "NAO_REGISTRADO" | "ADQUIRIDO_SEM_REGISTRO";
  label: string;
}

export type NoArvore = NoArvoreConhecido | NoArvoreAusente;

export interface ArvoreGenealogica {
  ave: NoArvoreConhecido;
  pai: NoArvore;
  mae: NoArvore;
  paiDoPai: NoArvore;
  maeDoPai: NoArvore;
  paiDaMae: NoArvore;
  maeDaMae: NoArvore;
}

type GeneroSlot = "M" | "F";

const ROTULO_NAO_REGISTRADO: Record<GeneroSlot, string> = {
  M: "Não registrado",
  F: "Não registrada",
};

const ROTULO_ADQUIRIDO_SEM_REGISTRO: Record<GeneroSlot, string> = {
  M: "Adquirido — sem registro",
  F: "Adquirida — sem registro",
};

function noConhecido(ave: AveAncestralNode): NoArvoreConhecido {
  return {
    conhecido: true,
    id: ave.id,
    nomeApelido: ave.nomeApelido,
    anilha: ave.anilha,
    sexo: ave.sexo,
    origem: ave.origem,
  };
}

function noAncestral(
  ave: AveAncestralNode | null | undefined,
  generoSlot: GeneroSlot,
  ancestralConhecidoMaisProximoFoiAdquirido: boolean,
): NoArvore {
  if (!ave) {
    return ancestralConhecidoMaisProximoFoiAdquirido
      ? {
          conhecido: false,
          motivo: "ADQUIRIDO_SEM_REGISTRO",
          label: ROTULO_ADQUIRIDO_SEM_REGISTRO[generoSlot],
        }
      : {
          conhecido: false,
          motivo: "NAO_REGISTRADO",
          label: ROTULO_NAO_REGISTRADO[generoSlot],
        };
  }
  return noConhecido(ave);
}

export function construirArvoreGenealogica(ave: AveAncestralNode): ArvoreGenealogica {
  const pai = ave.paiAve ?? null;
  const mae = ave.maeAve ?? null;

  return {
    ave: noConhecido(ave),
    pai: noAncestral(pai, "M", ave.origem === "ADQUIRIDA"),
    mae: noAncestral(mae, "F", ave.origem === "ADQUIRIDA"),
    paiDoPai: noAncestral(pai?.paiAve, "M", Boolean(pai && pai.origem === "ADQUIRIDA")),
    maeDoPai: noAncestral(pai?.maeAve, "F", Boolean(pai && pai.origem === "ADQUIRIDA")),
    paiDaMae: noAncestral(mae?.paiAve, "M", Boolean(mae && mae.origem === "ADQUIRIDA")),
    maeDaMae: noAncestral(mae?.maeAve, "F", Boolean(mae && mae.origem === "ADQUIRIDA")),
  };
}
