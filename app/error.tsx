"use client";

import { useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

/**
 * Rede de segurança para qualquer exceção não tratada em uma Server Action ou
 * Server Component (ex: uma ave excluída cujo link ainda existe em algum
 * lugar, uma falha inesperada de banco). Sem este arquivo, o usuário cai na
 * tela de erro genérica e sem estilo do navegador — aqui ele pelo menos
 * entende o que houve e tem como tentar de novo ou voltar.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 box-border bg-background">
      <div className="w-full max-w-[420px] flex flex-col items-center gap-5 text-center">
        <div className="w-14 h-14 rounded-2xl bg-danger-bg border-[1.5px] border-terracota flex items-center justify-center">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8A3830"
            strokeWidth={2}
          >
            <path d="M12 2L1 21h22L12 2z M12 9v5 M12 17h.01" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h1 className="font-serif font-semibold text-2xl text-text-primary m-0">
            Algo deu errado
          </h1>
          <p className="font-sans text-sm text-text-secondary mt-2 mb-0 leading-normal">
            Não foi possível concluir essa ação. Tente novamente — se o
            problema continuar, volte para o início e tente de outro jeito.
          </p>
        </div>
        <div className="flex gap-3 w-full mt-1">
          <Link
            href="/dashboard"
            className="flex-1 text-center no-underline font-sans font-bold text-sm text-text-secondary border-[1.5px] border-border px-4 py-3.5 rounded-[10px]"
          >
            Voltar ao início
          </Link>
          <Button onClick={() => reset()} className="flex-1">
            Tentar novamente
          </Button>
        </div>
      </div>
    </div>
  );
}
