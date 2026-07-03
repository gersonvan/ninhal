import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ParentescoInvalidoError } from "./compatibility";
import { AnilhaDuplicadaError, RegistroNaoEncontradoError } from "./errors";

/** Traduz erros conhecidos da camada de serviço de Aves para respostas HTTP. Relança o restante. */
export function aveErrorResponse(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Dados inválidos.", issues: error.issues },
      { status: 400 },
    );
  }
  if (error instanceof AnilhaDuplicadaError || error instanceof ParentescoInvalidoError) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }
  if (error instanceof RegistroNaoEncontradoError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  throw error;
}
