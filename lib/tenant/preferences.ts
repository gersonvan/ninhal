import { prisma } from "@/lib/prisma";

/**
 * Lê a preferência "alertas de consanguinidade ativados" do tenant informado.
 * Default true — se o tenant não for encontrado, também retorna true (comportamento
 * seguro por padrão) em vez de lançar, já que esta é uma leitura de preferência, não
 * uma operação que dependa da existência do tenant para ter efeito colateral.
 */
export async function alertasConsanguinidadeAtivados(tenantId: string): Promise<boolean> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { alertasConsanguinidadeAtivados: true },
  });
  return tenant?.alertasConsanguinidadeAtivados ?? true;
}
