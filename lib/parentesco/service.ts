import { prisma } from "@/lib/prisma";
import { RegistroNaoEncontradoError } from "@/lib/aves/errors";
import { calcularCoeficienteParentesco, type NoParentesco } from "./coeficiente";

const INCLUDE_ANCESTRAIS = {
  paiAve: { include: { paiAve: true, maeAve: true } },
  maeAve: { include: { paiAve: true, maeAve: true } },
} as const;

interface AveComAncestraisParcial {
  id: string;
  paiAve?: AveComAncestraisParcial | null;
  maeAve?: AveComAncestraisParcial | null;
}

/**
 * Converte o resultado do Prisma (aninhado até avós, conforme INCLUDE_ANCESTRAIS)
 * para a árvore genealógica genérica usada pelo cálculo. Níveis mais profundos do
 * que o incluído na consulta ficam `undefined` e viram `null` aqui, terminando a
 * recursão do cálculo como um ancestral desconhecido/fundador.
 */
function converterParaNo(
  ave: AveComAncestraisParcial | null | undefined,
): NoParentesco | null {
  if (!ave) return null;
  return {
    id: ave.id,
    pai: converterParaNo(ave.paiAve),
    mae: converterParaNo(ave.maeAve),
  };
}

/**
 * Coeficiente de parentesco entre duas aves do tenant do contexto atual, como
 * percentual (0-100), usando as três gerações rastreadas (a própria ave, pais e avós).
 */
export async function calcularCoeficienteParentescoEntreAves(
  aveAId: string,
  aveBId: string,
): Promise<number> {
  const aveA = await prisma.ave.findUnique({
    where: { id: aveAId },
    include: INCLUDE_ANCESTRAIS,
  });
  if (!aveA) throw new RegistroNaoEncontradoError("Ave");

  const aveB = await prisma.ave.findUnique({
    where: { id: aveBId },
    include: INCLUDE_ANCESTRAIS,
  });
  if (!aveB) throw new RegistroNaoEncontradoError("Ave");

  const noA = converterParaNo(aveA);
  const noB = converterParaNo(aveB);
  if (!noA || !noB) return 0;

  return calcularCoeficienteParentesco(noA, noB);
}
