import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Cliente Supabase com service role, usado apenas pela suíte E2E para
 * localizar/excluir o usuário de teste ao final da execução — o cadastro em
 * si é sempre feito pela UI real.
 */
function criarClienteAdmin() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Busca o id do usuário recém-cadastrado pelo e-mail, com algumas tentativas
 * para tolerar eventual atraso de propagação da Admin API logo após o cadastro.
 */
export async function buscarUsuarioIdPorEmail(email: string): Promise<string> {
  const admin = criarClienteAdmin();

  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (error) {
      throw new Error(`Não foi possível listar usuários: ${error.message}`);
    }
    const usuario = data.users.find((u) => u.email === email);
    if (usuario) {
      return usuario.id;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Usuário de teste ${email} não encontrado após o cadastro.`);
}

export async function excluirUsuario(userId: string): Promise<void> {
  const admin = criarClienteAdmin();
  await admin.auth.admin.deleteUser(userId);
}
