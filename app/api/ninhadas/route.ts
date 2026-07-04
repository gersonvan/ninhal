import { NextRequest, NextResponse } from "next/server";
import { runWithTenant } from "@/lib/tenant/context";
import { requireTenantId } from "@/lib/tenant/request-context";
import { createNinhada, listNinhadas } from "@/lib/ninhadas/service";
import { ninhadaErrorResponse } from "@/lib/ninhadas/http";

export async function GET() {
  const ctx = await requireTenantId();
  if ("response" in ctx) return ctx.response;

  const ninhadas = await runWithTenant(ctx.tenantId, () => listNinhadas());
  return NextResponse.json(ninhadas);
}

export async function POST(request: NextRequest) {
  const ctx = await requireTenantId();
  if ("response" in ctx) return ctx.response;

  const body = await request.json();
  try {
    const ninhada = await runWithTenant(ctx.tenantId, () => createNinhada(body));
    return NextResponse.json(ninhada, { status: 201 });
  } catch (error) {
    return ninhadaErrorResponse(error);
  }
}
