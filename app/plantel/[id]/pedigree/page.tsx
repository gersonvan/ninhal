import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { runWithTenant } from "@/lib/tenant/context";
import { montarDadosPedigree } from "@/lib/pedigree/service";
import { resolverNomeResponsavel } from "@/lib/pedigree/responsavel";
import { RegistroNaoEncontradoError } from "@/lib/aves/errors";
import ExportarPedigreeView from "./ExportarPedigreeView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ExportarPedigreePage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const tenant = await prisma.tenant.findUnique({ where: { ownerId: user.id } });
  if (!tenant) {
    redirect("/onboarding");
  }

  const { id } = await params;
  const responsavelNome = resolverNomeResponsavel(user);

  const dados = await buscarDadosOu404(() =>
    runWithTenant(tenant.id, () => montarDadosPedigree(id, tenant.id, responsavelNome)),
  );

  return <ExportarPedigreeView aveId={id} dados={dados} />;
}

async function buscarDadosOu404<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof RegistroNaoEncontradoError) {
      notFound();
    }
    throw error;
  }
}
