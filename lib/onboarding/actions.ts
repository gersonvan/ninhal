"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { uploadLogo } from "@/lib/tenant/logo";

export type OnboardingState = { error: string } | null;

export async function completeOnboardingAction(
  _prevState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
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
          "Não foi possível enviar o logo agora. Você pode pular esta etapa e adicionar depois.",
      };
    }
    logoUrl = url;
  }

  await prisma.tenant.upsert({
    where: { ownerId: user.id },
    create: { ownerId: user.id, name, focus: focus || null, logoUrl },
    update: {
      name,
      focus: focus || null,
      ...(logoUrl ? { logoUrl } : {}),
    },
  });

  // Passo opcional do onboarding (Task 2.7): o usuário pode escolher importar
  // o plantel do IBAMA agora, ou pular e ir direto para o Dashboard (mesmo
  // comportamento de sempre para quem não usa a opção).
  const redirecionarPara = String(formData.get("redirecionarPara") ?? "dashboard");
  if (redirecionarPara === "importar-ibama") {
    redirect("/configuracoes/importar-ibama");
  }

  redirect("/dashboard");
}
