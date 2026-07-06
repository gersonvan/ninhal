export interface EspecieResumo {
  id: string;
  nome: string;
}

/** Chama o endpoint de criação de espécie (normalização/dedup ficam no servidor). */
export async function criarEspecie(nome: string): Promise<EspecieResumo> {
  const res = await fetch("/api/especies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "Não foi possível adicionar a espécie.");
  }
  return res.json();
}
