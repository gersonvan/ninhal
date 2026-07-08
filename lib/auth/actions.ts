"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { buildSignUpPayload } from "@/lib/auth/signup";
import { validarNovaSenha } from "@/lib/auth/nova-senha";

export type AuthActionState = { error: string } | null;
export type PasswordResetState = { error: string } | { success: true } | null;

function translateAuthError(message: string): string {
  if (message.includes("Invalid login credentials")) {
    return "E-mail ou senha inválidos.";
  }
  if (message.includes("User already registered")) {
    return "Este e-mail já está cadastrado.";
  }
  if (message.includes("Password should be at least")) {
    return "A senha deve ter pelo menos 6 caracteres.";
  }
  if (message.includes("should be different from the old password")) {
    return "A nova senha deve ser diferente da senha atual.";
  }
  if (message.includes("Auth session missing")) {
    return "O link de redefinição expirou. Solicite um novo em \"Esqueci minha senha\".";
  }
  return "Não foi possível concluir a operação. Tente novamente.";
}

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp(buildSignUpPayload(formData));

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  redirect("/onboarding");
}

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const { email, password } = readCredentials(formData);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  redirect("/dashboard");
}

export async function requestPasswordResetAction(
  _prevState: PasswordResetState,
  formData: FormData,
): Promise<PasswordResetState> {
  const email = String(formData.get("email") ?? "").trim();
  const supabase = await createClient();

  // O link do e-mail precisa voltar para o app: a rota /auth/confirm troca o
  // código de recuperação por uma sessão e encaminha para a tela de nova senha.
  const requestHeaders = await headers();
  const origin =
    requestHeaders.get("origin") ??
    `https://${requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host")}`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/redefinir-senha`,
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  return { success: true };
}

export async function updatePasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = String(formData.get("password") ?? "");
  const confirmacao = String(formData.get("passwordConfirm") ?? "");

  const erroValidacao = validarNovaSenha(password, confirmacao);
  if (erroValidacao) {
    return { error: erroValidacao };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
