"use client";

import { useActionState, useState } from "react";
import {
  requestPasswordResetAction,
  signInAction,
  signUpAction,
} from "@/lib/auth/actions";

const inputClass =
  "font-sans text-[15px] px-4 py-3.5 rounded-[10px] border-[1.5px] border-input-border bg-white text-text-primary";
const labelClass = "text-[13px] font-bold text-[#4a4638]";
const primaryButtonClass =
  "text-center font-sans font-bold text-[15px] bg-oliva-600 text-background px-4 py-[15px] rounded-[10px]";

type Tab = "login" | "signup" | "recover";

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("login");
  const [loginState, loginAction, loginPending] = useActionState(
    signInAction,
    null,
  );
  const [signupState, signupAction, signupPending] = useActionState(
    signUpAction,
    null,
  );
  const [recoverState, recoverAction, recoverPending] = useActionState(
    requestPasswordResetAction,
    null,
  );

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
            Gestão genética para criadores de aves
          </div>
        </div>

        <div className="bg-background rounded-[20px] px-7 py-8 flex flex-col gap-5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.4)]">
          <div className="flex bg-tab-track rounded-xl p-1">
            <button
              type="button"
              onClick={() => setTab("login")}
              className={`flex-1 py-2.5 rounded-[9px] font-sans font-bold text-sm cursor-pointer ${
                tab === "login"
                  ? "bg-oliva-600 text-background"
                  : "bg-transparent text-text-secondary"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setTab("signup")}
              className={`flex-1 py-2.5 rounded-[9px] font-sans font-bold text-sm cursor-pointer ${
                tab === "signup"
                  ? "bg-oliva-600 text-background"
                  : "bg-transparent text-text-secondary"
              }`}
            >
              Criar conta
            </button>
          </div>

          {tab === "login" && (
            <form action={loginAction} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor="login-email">
                  E-mail
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  placeholder="voce@aviario.com.br"
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor="login-password">
                  Senha
                </label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
              {loginState?.error && (
                <p className="text-sm font-semibold text-terracota">
                  {loginState.error}
                </p>
              )}
              <button
                type="button"
                onClick={() => setTab("recover")}
                className="self-end bg-transparent border-none font-sans text-[13px] font-bold text-oliva-600 cursor-pointer p-0"
              >
                Esqueci minha senha
              </button>
              <button
                type="submit"
                disabled={loginPending}
                className={`${primaryButtonClass} border-none cursor-pointer disabled:opacity-70`}
              >
                {loginPending ? "Entrando..." : "Entrar"}
              </button>
            </form>
          )}

          {tab === "signup" && (
            <form action={signupAction} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor="signup-name">
                  Nome completo
                </label>
                <input
                  id="signup-name"
                  name="name"
                  required
                  placeholder="Carlos Menezes"
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor="signup-email">
                  E-mail
                </label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  required
                  placeholder="voce@aviario.com.br"
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor="signup-password">
                  Senha
                </label>
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Crie uma senha"
                  className={inputClass}
                />
              </div>
              {signupState?.error && (
                <p className="text-sm font-semibold text-terracota">
                  {signupState.error}
                </p>
              )}
              <button
                type="submit"
                disabled={signupPending}
                className={`${primaryButtonClass} border-none cursor-pointer disabled:opacity-70`}
              >
                {signupPending ? "Criando conta..." : "Criar conta"}
              </button>
            </form>
          )}

          {tab === "recover" && (
            <form action={recoverAction} className="flex flex-col gap-4">
              <p className="font-sans text-sm text-text-secondary leading-normal">
                Informe seu e-mail cadastrado. Enviaremos um link para
                redefinir sua senha.
              </p>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor="recover-email">
                  E-mail
                </label>
                <input
                  id="recover-email"
                  name="email"
                  type="email"
                  required
                  placeholder="voce@aviario.com.br"
                  className={inputClass}
                />
              </div>
              {recoverState && "error" in recoverState && (
                <p className="text-sm font-semibold text-terracota">
                  {recoverState.error}
                </p>
              )}
              {recoverState && "success" in recoverState && (
                <p className="text-sm font-semibold text-oliva-600">
                  Link enviado! Verifique sua caixa de entrada.
                </p>
              )}
              <button
                type="submit"
                disabled={recoverPending}
                className={`${primaryButtonClass} border-none cursor-pointer disabled:opacity-70`}
              >
                {recoverPending ? "Enviando..." : "Enviar link"}
              </button>
              <button
                type="button"
                onClick={() => setTab("login")}
                className="bg-transparent border-none font-sans text-[13px] font-bold text-text-secondary cursor-pointer p-0"
              >
                Voltar ao login
              </button>
            </form>
          )}
        </div>

        <div className="text-center font-sans text-xs text-[#8DA271]">
          Feito para quem cria no dia a dia — no viveiro, no sol, com uma mão
          só.
        </div>
      </div>
    </div>
  );
}
