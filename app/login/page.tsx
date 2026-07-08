"use client";

import { useActionState, useState } from "react";
import {
  requestPasswordResetAction,
  signInAction,
  signUpAction,
} from "@/lib/auth/actions";
import Button from "@/components/ui/Button";
import PasswordField from "@/components/ui/PasswordField";
import TextField from "@/components/ui/TextField";

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
              <TextField
                id="login-email"
                name="email"
                type="email"
                required
                label="E-mail"
                placeholder="voce@aviario.com.br"
              />
              <PasswordField
                id="login-password"
                name="password"
                required
                label="Senha"
                placeholder="••••••••"
              />
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
              <Button type="submit" disabled={loginPending}>
                {loginPending ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          )}

          {tab === "signup" && (
            <form action={signupAction} className="flex flex-col gap-4">
              <TextField
                id="signup-name"
                name="name"
                required
                label="Nome completo"
                placeholder="Carlos Menezes"
              />
              <TextField
                id="signup-email"
                name="email"
                type="email"
                required
                label="E-mail"
                placeholder="voce@aviario.com.br"
              />
              <PasswordField
                id="signup-password"
                name="password"
                required
                minLength={6}
                label="Senha"
                placeholder="Crie uma senha"
              />
              {signupState?.error && (
                <p className="text-sm font-semibold text-terracota">
                  {signupState.error}
                </p>
              )}
              <Button type="submit" disabled={signupPending}>
                {signupPending ? "Criando conta..." : "Criar conta"}
              </Button>
            </form>
          )}

          {tab === "recover" && (
            <form action={recoverAction} className="flex flex-col gap-4">
              <p className="font-sans text-sm text-text-secondary leading-normal">
                Informe seu e-mail cadastrado. Enviaremos um link para
                redefinir sua senha.
              </p>
              <TextField
                id="recover-email"
                name="email"
                type="email"
                required
                label="E-mail"
                placeholder="voce@aviario.com.br"
              />
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
              <Button type="submit" disabled={recoverPending}>
                {recoverPending ? "Enviando..." : "Enviar link"}
              </Button>
              <Button
                type="button"
                variant="tertiary"
                onClick={() => setTab("login")}
                className="!text-text-secondary"
              >
                Voltar ao login
              </Button>
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
