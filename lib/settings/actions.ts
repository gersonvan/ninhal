"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { uploadLogo } from "@/lib/tenant/logo";
import { atualizarAlertasConsanguinidade } from "@/lib/tenant/preferences";

export type SettingsState = { error: string } | { success: true } | null;

export async function updateProfileAction(
  _prevState: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "Informe o nome do responsável." };
  }

  const { error } = await supabase.auth.updateUser({
    data: { full_name: name },
  });

  if (error) {
    return { error: "Não foi possível atualizar o nome agora. Tente novamente." };
  }

  return { success: true };
}

export async function updateCriatorioAction(
  _prevState: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const tenant = await prisma.tenant.findUnique({ where: { ownerId: user.id } });
  if (!tenant) {
    redirect("/onboarding");
  }

  const name = String(formData.get("name") ?? "").trim();
  const focus = String(formData.get("focus") ?? "").trim();
  const logo = formData.get("logo");

  if (!name) {
    return { error: "Informe o nome do criatório." };
  }

  let logoUrl: string | undefined;

  if (logo instanceof File && logo.size > 0) {
    const url = await uploadLogo(supabase, user.id, logo);
    if (!url) {
      return {
        error:
          "Não foi possível enviar o logo agora. Você pode tentar novamente mais tarde.",
      };
    }
    logoUrl = url;
  }

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      name,
      focus: focus || null,
      ...(logoUrl ? { logoUrl } : {}),
    },
  });

  return { success: true };
}

/**
 * Atualiza a preferência de alertas de consanguinidade do tenant do usuário
 * autenticado. O tenant é resolvido a partir da sessão, nunca de um id
 * recebido do cliente, para não depender de validação externa de propriedade.
 */
export async function updateAlertasConsanguinidadeAction(
  ativado: boolean,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const tenant = await prisma.tenant.findUnique({ where: { ownerId: user.id } });
  if (!tenant) {
    redirect("/onboarding");
  }

  await atualizarAlertasConsanguinidade(tenant.id, ativado);
}
