import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { runWithTenant } from "@/lib/tenant/context";
import { montarDadosPedigree } from "@/lib/pedigree/service";
import { resolverNomeResponsavel } from "@/lib/pedigree/responsavel";
import PedigreeDocument from "@/lib/pedigree/PedigreeDocument";
import { RegistroNaoEncontradoError } from "@/lib/aves/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const tenant = await prisma.tenant.findUnique({ where: { ownerId: user.id } });
  if (!tenant) {
    return NextResponse.json(
      { error: "Onboarding não concluído." },
      { status: 403 },
    );
  }

  const { id } = await params;

  try {
    const responsavelNome = resolverNomeResponsavel(user);

    const dados = await runWithTenant(tenant.id, () =>
      montarDadosPedigree(id, tenant.id, responsavelNome),
    );

    const buffer = await renderToBuffer(PedigreeDocument({ dados }));

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="pedigree-${dados.ave.anilha}.pdf"`,
      },
    });
  } catch (error) {
    if (error instanceof RegistroNaoEncontradoError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}
