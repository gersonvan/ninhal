import { createClient } from "@/lib/supabase/server";

/** Retorna o usuário autenticado da sessão atual, ou null se não houver sessão. */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
