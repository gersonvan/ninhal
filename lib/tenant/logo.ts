import type { SupabaseClient } from "@supabase/supabase-js";

const LOGO_BUCKET = "logos";

/** Envia o arquivo de logo para o Storage do Supabase e retorna a URL pública, ou null em caso de falha. */
export async function uploadLogo(
  supabase: SupabaseClient,
  userId: string,
  logo: File,
): Promise<string | null> {
  const extension = logo.name.split(".").pop() ?? "png";
  const path = `${userId}/logo-${Date.now()}.${extension}`;
  const { error } = await supabase.storage
    .from(LOGO_BUCKET)
    .upload(path, logo, { upsert: true });

  if (error) {
    return null;
  }

  return supabase.storage.from(LOGO_BUCKET).getPublicUrl(path).data.publicUrl;
}
