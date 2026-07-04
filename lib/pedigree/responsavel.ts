import type { User } from "@supabase/supabase-js";

/**
 * Nome do responsável a exibir no certificado de pedigree: usa o e-mail
 * autenticado como alternativa, já que o nome completo coletado no cadastro
 * (Task 1.3) não é persistido em lugar nenhum hoje (achado da Task 4.3).
 */
export function resolverNomeResponsavel(user: Pick<User, "email">): string {
  return user.email ?? "Responsável não identificado";
}
