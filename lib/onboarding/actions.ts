"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export type OnboardingState = { error: string } | null;

const LOGO_BUCKET = "logos";

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
    const extension = logo.name.split(".").pop() ?? "png";
    const path = `${user.id}/logo-${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from(LOGO_BUCKET)
      .upload(path, logo, { upsert: true });

    if (uploadError) {
      return {
        error:
          "Não foi possível enviar o logo agora. Você pode pular esta etapa e adicionar depois.",
      };
    }

    logoUrl = supabase.storage.from(LOGO_BUCKET).getPublicUrl(path).data
      .publicUrl;
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

  redirect("/dashboard");
}
