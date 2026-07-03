import { NextRequest, NextResponse } from "next/server";
import { runWithTenant } from "@/lib/tenant/context";
import { requireTenantId } from "@/lib/aves/request-context";
import { createAve, listAves } from "@/lib/aves/service";
import { aveErrorResponse } from "@/lib/aves/http";

export async function GET() {
  const ctx = await requireTenantId();
  if ("response" in ctx) return ctx.response;

  const aves = await runWithTenant(ctx.tenantId, () => listAves());
  return NextResponse.json(aves);
}

export async function POST(request: NextRequest) {
  const ctx = await requireTenantId();
  if ("response" in ctx) return ctx.response;

  const body = await request.json();
  try {
    const ave = await runWithTenant(ctx.tenantId, () => createAve(body));
    return NextResponse.json(ave, { status: 201 });
  } catch (error) {
    return aveErrorResponse(error);
  }
}
