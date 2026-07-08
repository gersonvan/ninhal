"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { createClient } from "@/lib/supabase/server";
import { runWithTenant } from "@/lib/tenant/context";
import { createAve, deleteAve, updateAve } from "./service";
import {
  AnilhaDuplicadaError,
  AveComVinculosError,
  RegistroNaoEncontradoError,
} from "./errors";
import { ParentescoInvalidoError } from "./compatibility";
import { requireTenantOrRedirect } from "./require-tenant";

export type AveFormState = { error: string } | null;

const FOTO_BUCKET = "fotos-aves";

function readOptionalString(formData: FormData, key: string): string | undefined {
  const value = String(formData.get(key) ?? "").trim();
  return value ? value : undefined;
}

function mapAveServiceError(error: unknown): AveFormState {
  if (error instanceof ZodError) {
    return { error: "Preencha os campos obrigatórios corretamente." };
  }
  if (
    error instanceof AnilhaDuplicadaError ||
    error instanceof AveComVinculosError ||
    error instanceof ParentescoInvalidoError ||
    error instanceof RegistroNaoEncontradoError
  ) {
    return { error: error.message };
  }
  throw error;
}

async function uploadFotoSeEnviada(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tenantId: string,
  formData: FormData,
): Promise<{ fotoUrl?: string; error?: string }> {
  const foto = formData.get("foto");
  if (!(foto instanceof File) || foto.size === 0) {
    return {};
  }

  const extension = foto.name.split(".").pop() ?? "jpg";
  const path = `${tenantId}/${Date.now()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from(FOTO_BUCKET)
    .upload(path, foto, { upsert: true });

  if (uploadError) {
    return {
      error:
        "Não foi possível enviar a foto agora. Você pode salvar sem foto e adicionar depois.",
    };
  }

  const fotoUrl = supabase.storage.from(FOTO_BUCKET).getPublicUrl(path).data
    .publicUrl;
  return { fotoUrl };
}

function readAveInput(formData: FormData) {
  return {
    anilha: readOptionalString(formData, "anilha"),
    nomeApelido: readOptionalString(formData, "nomeApelido"),
    especieId: readOptionalString(formData, "especieId"),
    mutacaoCor: readOptionalString(formData, "mutacaoCor"),
    sexo: readOptionalString(formData, "sexo"),
    dataNascimento: readOptionalString(formData, "dataNascimento"),
    origem: readOptionalString(formData, "origem"),
    anilhaPaiId: readOptionalString(formData, "anilhaPaiId"),
    anilhaMaeId: readOptionalString(formData, "anilhaMaeId"),
    status: readOptionalString(formData, "status"),
    registro: readOptionalString(formData, "registro"),
  };
}

export async function createAveAction(
  _prevState: AveFormState,
  formData: FormData,
): Promise<AveFormState> {
  const { supabase, tenant } = await requireTenantOrRedirect();

  const { fotoUrl, error: uploadErro } = await uploadFotoSeEnviada(
    supabase,
    tenant.id,
    formData,
  );
  if (uploadErro) return { error: uploadErro };

  const input = { ...readAveInput(formData), foto: fotoUrl };

  try {
    const ave = await runWithTenant(tenant.id, () => createAve(input));
    redirect(`/plantel/${ave.id}`);
  } catch (error) {
    return mapAveServiceError(error);
  }
}

export async function updateAveAction(
  _prevState: AveFormState,
  formData: FormData,
): Promise<AveFormState> {
  const { supabase, tenant } = await requireTenantOrRedirect();

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Ave inválida." };

  const { fotoUrl, error: uploadErro } = await uploadFotoSeEnviada(
    supabase,
    tenant.id,
    formData,
  );
  if (uploadErro) return { error: uploadErro };

  const input = {
    ...readAveInput(formData),
    ...(fotoUrl ? { foto: fotoUrl } : {}),
  };

  try {
    await runWithTenant(tenant.id, () => updateAve(id, input));
  } catch (error) {
    return mapAveServiceError(error);
  }

  revalidatePath(`/plantel/${id}`);
  redirect(`/plantel/${id}`);
}

export async function deleteAveAction(
  _prevState: AveFormState,
  formData: FormData,
): Promise<AveFormState> {
  const { tenant } = await requireTenantOrRedirect();

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Ave inválida." };

  try {
    await runWithTenant(tenant.id, () => deleteAve(id));
  } catch (error) {
    return mapAveServiceError(error);
  }

  revalidatePath("/plantel");
  redirect("/plantel");
}
