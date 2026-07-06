import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireTenantId } from "@/lib/tenant/request-context";
import { criarOuReaproveitarEspecie, listarEspecies } from "@/lib/especies/service";

/** Catálogo de espécies (não é isolado por tenant — compartilhado entre todos os criadores). */
export async function GET() {
  const ctx = await requireTenantId();
  if ("response" in ctx) return ctx.response;

  const especies = await listarEspecies();
  return NextResponse.json(especies);
}

export async function POST(request: Request) {
  const ctx = await requireTenantId();
  if ("response" in ctx) return ctx.response;

  try {
    const body = await request.json();
    const { especie, criada } = await criarOuReaproveitarEspecie(body);
    return NextResponse.json(especie, { status: criada ? 201 : 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos.", issues: error.issues },
        { status: 400 },
      );
    }
    throw error;
  }
}
