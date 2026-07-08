import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Destino dos links de autenticação enviados por e-mail (ex: recuperação de
 * senha). Aceita dois formatos e encaminha para o destino indicado em `next`:
 *
 * - `token_hash` + `type` (template de e-mail customizado): validado via
 *   verifyOtp — funciona em qualquer navegador/dispositivo.
 * - `code` (fluxo PKCE padrão): trocado por sessão — só funciona no mesmo
 *   navegador em que o link foi solicitado, pois depende do cookie com o
 *   code verifier criado no pedido.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Só aceitamos destinos internos, para o link do e-mail não poder ser
  // manipulado para redirecionar a outro site.
  const destino = next.startsWith("/") ? next : "/dashboard";

  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(new URL(destino, request.url));
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(destino, request.url));
    }
  }

  return NextResponse.redirect(
    new URL("/redefinir-senha?erro=link-invalido", request.url),
  );
}
