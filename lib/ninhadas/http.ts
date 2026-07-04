import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ParentescoInvalidoError } from "@/lib/aves/compatibility";
import { RegistroNaoEncontradoError } from "@/lib/aves/errors";
import { CodNinhadaDuplicadoError } from "./errors";

/** Traduz erros conhecidos da camada de serviço de Ninhadas para respostas HTTP. Relança o restante. */
export function ninhadaErrorResponse(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Dados inválidos.", issues: error.issues },
      { status: 400 },
    );
  }
  if (error instanceof CodNinhadaDuplicadoError || error instanceof ParentescoInvalidoError) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }
  if (error instanceof RegistroNaoEncontradoError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  throw error;
}
