import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Destino dos links de autenticação enviados por e-mail (ex: recuperação de
 * senha). Troca o código PKCE da URL por uma sessão e encaminha o usuário
 * para o destino indicado em `next`.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Só aceitamos destinos internos, para o link do e-mail não poder ser
  // manipulado para redirecionar a outro site.
  const destino = next.startsWith("/") ? next : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(destino, request.url));
    }
  }

  return NextResponse.redirect(
    new URL("/redefinir-senha?erro=link-invalido", request.url),
  );
}
