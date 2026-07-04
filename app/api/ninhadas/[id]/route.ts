import { NextRequest, NextResponse } from "next/server";
import { runWithTenant } from "@/lib/tenant/context";
import { requireTenantId } from "@/lib/tenant/request-context";
import { getNinhada, updateNinhada } from "@/lib/ninhadas/service";
import { ninhadaErrorResponse } from "@/lib/ninhadas/http";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const ctx = await requireTenantId();
  if ("response" in ctx) return ctx.response;

  const { id } = await params;
  const ninhada = await runWithTenant(ctx.tenantId, () => getNinhada(id));
  if (!ninhada) {
    return NextResponse.json({ error: "Ninhada não encontrada." }, { status: 404 });
  }
  return NextResponse.json(ninhada);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const ctx = await requireTenantId();
  if ("response" in ctx) return ctx.response;

  const { id } = await params;
  const body = await request.json();
  try {
    const ninhada = await runWithTenant(ctx.tenantId, () => updateNinhada(id, body));
    return NextResponse.json(ninhada);
  } catch (error) {
    return ninhadaErrorResponse(error);
  }
}
