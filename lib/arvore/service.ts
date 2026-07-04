import { prisma } from "@/lib/prisma";
import { RegistroNaoEncontradoError } from "@/lib/aves/errors";
import { construirArvoreGenealogica, type ArvoreGenealogica } from "./construir";

const INCLUDE_ANCESTRAIS = {
  paiAve: { include: { paiAve: true, maeAve: true } },
  maeAve: { include: { paiAve: true, maeAve: true } },
} as const;

/** Monta a árvore genealógica de 3 gerações (ave, pais, avós) para a ave informada. */
export async function montarArvoreGenealogica(
  aveId: string,
): Promise<ArvoreGenealogica> {
  const ave = await prisma.ave.findUnique({
    where: { id: aveId },
    include: INCLUDE_ANCESTRAIS,
  });
  if (!ave) throw new RegistroNaoEncontradoError("Ave");

  return construirArvoreGenealogica(ave);
}
