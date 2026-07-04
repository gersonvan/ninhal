import { NextRequest, NextResponse } from "next/server";
import { runWithTenant } from "@/lib/tenant/context";
import { requireTenantId } from "@/lib/tenant/request-context";
import { calcularCoeficienteParentescoEntreAves } from "@/lib/parentesco/service";
import { alertasConsanguinidadeAtivados } from "@/lib/tenant/preferences";
import { RegistroNaoEncontradoError } from "@/lib/aves/errors";

export async function GET(request: NextRequest) {
  const ctx = await requireTenantId();
  if ("response" in ctx) return ctx.response;

  const machoId = request.nextUrl.searchParams.get("machoId");
  const femeaId = request.nextUrl.searchParams.get("femeaId");
  if (!machoId || !femeaId) {
    return NextResponse.json(
      { error: "Informe machoId e femeaId." },
      { status: 400 },
    );
  }

  try {
    const [coeficiente, alertasAtivados] = await Promise.all([
      runWithTenant(ctx.tenantId, () =>
        calcularCoeficienteParentescoEntreAves(machoId, femeaId),
      ),
      alertasConsanguinidadeAtivados(ctx.tenantId),
    ]);
    return NextResponse.json({ coeficiente, alertasAtivados });
  } catch (error) {
    if (error instanceof RegistroNaoEncontradoError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}
