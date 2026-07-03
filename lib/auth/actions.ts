"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthActionResult = { error: string } | undefined;

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
  return "Não foi possível concluir a operação. Tente novamente.";
}

export async function signUp(
  email: string,
  password: string,
): Promise<AuthActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  redirect("/onboarding");
}

export async function signIn(
  email: string,
  password: string,
): Promise<AuthActionResult> {
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

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
