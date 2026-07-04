import { NextResponse } from "next/server";
import { requireTenantId } from "@/lib/tenant/request-context";
import { prisma } from "@/lib/prisma";

/** Catálogo de espécies (não é isolado por tenant — compartilhado entre todos os criadores). */
export async function GET() {
  const ctx = await requireTenantId();
  if ("response" in ctx) return ctx.response;

  const especies = await prisma.especie.findMany({ orderBy: { nome: "asc" } });
  return NextResponse.json(especies);
}
