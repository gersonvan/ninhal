import type { User } from "@supabase/supabase-js";

/**
 * Nome do responsável a exibir no certificado de pedigree: usa o nome completo
 * persistido no cadastro (`user_metadata.full_name`, Task 4.5), com o e-mail
 * autenticado como alternativa para contas criadas antes dessa persistência
 * existir (achado da Task 4.3).
 */
export function resolverNomeResponsavel(
  user: Pick<User, "email" | "user_metadata">,
): string {
  const nomeCompleto = String(user.user_metadata?.full_name ?? "").trim();
  return nomeCompleto || user.email || "Responsável não identificado";
}
