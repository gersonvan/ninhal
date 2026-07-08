import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import RedefinirSenhaForm from "./RedefinirSenhaForm";

export default async function RedefinirSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Sem sessão de recuperação válida (link expirado, já usado, ou acesso
  // direto à URL) não há como trocar a senha — orientamos a pedir novo link.
  const linkInvalido = erro === "link-invalido" || !user;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 box-border"
      style={{
        background:
          "radial-gradient(circle at 20% 10%, #3d4b2e 0%, #2B3623 60%)",
      }}
    >
      <div className="w-full max-w-[420px] flex flex-col gap-7">
        <div className="flex flex-col items-center gap-2.5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-oliva-600 border border-oliva-400 flex items-center justify-center">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#F7F3EA"
              strokeWidth={1.8}
            >
              <path d="M12 3c-3 2-5 5-5 9a5 5 0 0010 0c0-4-2-7-5-9z" />
              <path d="M12 12v9" />
              <path d="M8 21h8" />
            </svg>
          </div>
          <div className="font-serif font-semibold text-[26px] text-background">
            Ninhal
          </div>
          <div className="font-sans text-sm text-[#B9C2A9]">
            Redefinição de senha
          </div>
        </div>

        <div className="bg-background rounded-[20px] px-7 py-8 flex flex-col gap-5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.4)]">
          {linkInvalido ? (
            <div className="flex flex-col gap-4">
              <h1 className="font-serif font-semibold text-xl text-text-primary m-0">
                Link inválido ou expirado
              </h1>
              <p className="font-sans text-sm text-text-secondary leading-normal m-0">
                Este link de redefinição não é mais válido. Solicite um novo
                link em &quot;Esqueci minha senha&quot; na tela de login.
              </p>
              <Link
                href="/login"
                className="no-underline text-center font-sans font-bold text-sm bg-oliva-600 text-background py-3 rounded-xl"
              >
                Voltar ao login
              </Link>
            </div>
          ) : (
            <RedefinirSenhaForm />
          )}
        </div>
      </div>
    </div>
  );
}
