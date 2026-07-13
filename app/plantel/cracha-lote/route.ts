import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { runWithTenant } from "@/lib/tenant/context";
import { montarDadosCrachaLote } from "@/lib/pedigree/service";
import { resolverNomeResponsavel } from "@/lib/pedigree/responsavel";
import CrachaLoteDocument from "@/lib/pedigree/CrachaLoteDocument";
import { RegistroNaoEncontradoError } from "@/lib/aves/errors";

export async function GET(request: Request) {
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

  const ids = new URL(request.url).searchParams
    .get("ids")
    ?.split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (!ids || ids.length === 0) {
    return NextResponse.json(
      { error: "Selecione ao menos uma ave para gerar os crachás." },
      { status: 400 },
    );
  }

  try {
    const responsavelNome = resolverNomeResponsavel(user);

    const lote = await runWithTenant(tenant.id, () =>
      montarDadosCrachaLote(ids, tenant.id, responsavelNome),
    );

    const buffer = await renderToBuffer(CrachaLoteDocument({ lote }));

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="crachas-lote.pdf"`,
      },
    });
  } catch (error) {
    if (error instanceof RegistroNaoEncontradoError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}
