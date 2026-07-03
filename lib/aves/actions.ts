"use server";

import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { runWithTenant } from "@/lib/tenant/context";
import { createAve } from "./service";
import { AnilhaDuplicadaError, RegistroNaoEncontradoError } from "./errors";
import { ParentescoInvalidoError } from "./compatibility";

export type NovaAveState = { error: string } | null;

const FOTO_BUCKET = "fotos-aves";

function readOptionalString(formData: FormData, key: string): string | undefined {
  const value = String(formData.get(key) ?? "").trim();
  return value ? value : undefined;
}

export async function createAveAction(
  _prevState: NovaAveState,
  formData: FormData,
): Promise<NovaAveState> {
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

  const foto = formData.get("foto");
  let fotoUrl: string | undefined;

  if (foto instanceof File && foto.size > 0) {
    const extension = foto.name.split(".").pop() ?? "jpg";
    const path = `${tenant.id}/${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from(FOTO_BUCKET)
      .upload(path, foto, { upsert: true });

    if (uploadError) {
      return {
        error:
          "Não foi possível enviar a foto agora. Você pode salvar sem foto e adicionar depois.",
      };
    }

    fotoUrl = supabase.storage.from(FOTO_BUCKET).getPublicUrl(path).data
      .publicUrl;
  }

  const input = {
    anilha: readOptionalString(formData, "anilha"),
    nomeApelido: readOptionalString(formData, "nomeApelido"),
    especieId: readOptionalString(formData, "especieId"),
    mutacaoCor: readOptionalString(formData, "mutacaoCor"),
    sexo: readOptionalString(formData, "sexo"),
    dataNascimento: readOptionalString(formData, "dataNascimento"),
    origem: readOptionalString(formData, "origem"),
    anilhaPaiId: readOptionalString(formData, "anilhaPaiId"),
    anilhaMaeId: readOptionalString(formData, "anilhaMaeId"),
    foto: fotoUrl,
  };

  try {
    const ave = await runWithTenant(tenant.id, () => createAve(input));
    redirect(`/plantel/${ave.id}`);
  } catch (error) {
    if (error instanceof ZodError) {
      return { error: "Preencha os campos obrigatórios corretamente." };
    }
    if (error instanceof AnilhaDuplicadaError) {
      return { error: error.message };
    }
    if (error instanceof ParentescoInvalidoError) {
      return { error: error.message };
    }
    if (error instanceof RegistroNaoEncontradoError) {
      return { error: error.message };
    }
    throw error;
  }
}
