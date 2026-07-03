import { NextRequest, NextResponse } from "next/server";
import { runWithTenant } from "@/lib/tenant/context";
import { requireTenantId } from "@/lib/aves/request-context";
import { getAve, updateAve } from "@/lib/aves/service";
import { aveErrorResponse } from "@/lib/aves/http";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const ctx = await requireTenantId();
  if ("response" in ctx) return ctx.response;

  const { id } = await params;
  const ave = await runWithTenant(ctx.tenantId, () => getAve(id));
  if (!ave) {
    return NextResponse.json({ error: "Ave não encontrada." }, { status: 404 });
  }
  return NextResponse.json(ave);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const ctx = await requireTenantId();
  if ("response" in ctx) return ctx.response;

  const { id } = await params;
  const body = await request.json();
  try {
    const ave = await runWithTenant(ctx.tenantId, () => updateAve(id, body));
    return NextResponse.json(ave);
  } catch (error) {
    return aveErrorResponse(error);
  }
}
