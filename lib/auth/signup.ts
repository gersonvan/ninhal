/**
 * Monta o payload de `supabase.auth.signUp` a partir do formulário de cadastro,
 * persistindo o "Nome completo" em `user_metadata.full_name` (não havia
 * nenhum lugar persistindo esse dado até a Task 4.5 — ver achado da Task 4.3).
 */
export function buildSignUpPayload(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  return {
    email,
    password,
    options: { data: { full_name: name } },
  };
}
