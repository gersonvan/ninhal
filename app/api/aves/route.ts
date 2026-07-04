import { NextRequest, NextResponse } from "next/server";
import { runWithTenant } from "@/lib/tenant/context";
import { requireTenantId } from "@/lib/tenant/request-context";
import { createAve, listAves, type ListAvesFiltros } from "@/lib/aves/service";
import { aveErrorResponse } from "@/lib/aves/http";
import { SEXO_AVE_VALUES, STATUS_AVE_VALUES } from "@/lib/aves/schema";

function parseFiltros(searchParams: URLSearchParams): ListAvesFiltros {
  const filtros: ListAvesFiltros = {};

  const busca = searchParams.get("busca");
  if (busca) filtros.busca = busca;

  const especieId = searchParams.get("especieId");
  if (especieId) filtros.especieId = especieId;

  const sexo = searchParams.get("sexo");
  if (sexo && (SEXO_AVE_VALUES as readonly string[]).includes(sexo)) {
    filtros.sexo = sexo as ListAvesFiltros["sexo"];
  }

  const status = searchParams.get("status");
  if (status && (STATUS_AVE_VALUES as readonly string[]).includes(status)) {
    filtros.status = status as ListAvesFiltros["status"];
  }

  return filtros;
}

export async function GET(request: NextRequest) {
  const ctx = await requireTenantId();
  if ("response" in ctx) return ctx.response;

  const filtros = parseFiltros(request.nextUrl.searchParams);
  const aves = await runWithTenant(ctx.tenantId, () => listAves(filtros));
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
