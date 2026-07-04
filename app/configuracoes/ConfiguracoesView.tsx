"use client";

import { useActionState, useState, useTransition } from "react";
import type { User } from "@supabase/supabase-js";
import type { Tenant } from "@/app/generated/prisma/client";
import { signOut } from "@/lib/auth/actions";
import { resolverNomeResponsavel } from "@/lib/pedigree/responsavel";
import {
  updateAlertasConsanguinidadeAction,
  updateCriatorioAction,
  updateProfileAction,
} from "@/lib/settings/actions";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import Toggle from "@/components/ui/Toggle";

export default function ConfiguracoesView({
  user,
  tenant,
  alertasAtivadosInicial,
}: {
  user: User;
  tenant: Tenant;
  alertasAtivadosInicial: boolean;
}) {
  return (
    <div className="max-w-[640px] mx-auto px-5 pt-5 pb-6 flex flex-col gap-5">
      <h1 className="font-serif font-semibold text-2xl text-text-primary m-0">
        Configurações
      </h1>

      <PerfilCard user={user} />
      <CriatorioSection tenant={tenant} />
      <PreferenciasSection alertasAtivadosInicial={alertasAtivadosInicial} />

      <form action={signOut}>
        <Button
          type="submit"
          variant="secondary"
          className="w-full !border-danger-bg !text-terracota"
        >
          Sair da conta
        </Button>
      </form>
    </div>
  );
}

function PerfilCard({ user }: { user: User }) {
  const [editando, setEditando] = useState(false);
  const [state, formAction, pending] = useActionState(updateProfileAction, null);
  const nomeAtual = resolverNomeResponsavel(user);
  const nomePersistido = String(user.user_metadata?.full_name ?? "");

  if (editando && !(state && "success" in state)) {
    return (
      <div className="bg-surface border border-border rounded-[14px] p-[18px] flex flex-col gap-3">
        <form action={formAction} className="flex flex-col gap-3">
          <TextField
            name="name"
            label="Nome do responsável"
            defaultValue={nomePersistido}
            required
          />
          {state?.error && (
            <p className="text-sm font-semibold text-terracota m-0">
              {state.error}
            </p>
          )}
          <div className="flex gap-2.5">
            <Button type="submit" size="small" disabled={pending}>
              {pending ? "Salvando..." : "Salvar"}
            </Button>
            <Button
              type="button"
              variant="tertiary"
              size="small"
              onClick={() => setEditando(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-[14px] p-[18px] flex items-center gap-3.5">
      <div
        className="w-14 h-14 rounded-full shrink-0"
        style={{ background: "linear-gradient(135deg,#4B5D3A,#7C9364)" }}
      />
      <div className="flex-1">
        <div className="font-sans font-bold text-base text-text-primary">
          {nomeAtual}
        </div>
        <div className="font-sans text-[12.5px] text-text-muted">
          {user.email}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setEditando(true)}
        className="bg-transparent border-none font-sans font-bold text-[13px] text-oliva-600 cursor-pointer p-0"
      >
        Editar
      </button>
    </div>
  );
}

function CriatorioSection({ tenant }: { tenant: Tenant }) {
  const [editando, setEditando] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(updateCriatorioAction, null);

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  }

  return (
    <div>
      <div className="font-sans font-bold text-[11px] tracking-[0.06em] uppercase text-text-muted mb-2.5">
        Criatório
      </div>

      {editando && !(state && "success" in state) ? (
        <div className="bg-surface border border-border rounded-[14px] p-[18px] flex flex-col gap-3.5">
          <form action={formAction} className="flex flex-col gap-3.5">
            <TextField name="name" label="Nome do criatório" defaultValue={tenant.name ?? ""} required />
            <TextField name="focus" label="Foco de criação" defaultValue={tenant.focus ?? ""} />
            <div className="flex items-center gap-3">
              <label
                htmlFor="logo"
                className="w-16 h-16 rounded-full border-[1.5px] border-dashed border-input-border bg-white flex items-center justify-center text-text-muted text-[11px] cursor-pointer overflow-hidden shrink-0 text-center"
              >
                {logoPreview || tenant.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoPreview ?? tenant.logoUrl ?? ""}
                    alt="Logo do criatório"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  "Logo"
                )}
              </label>
              <input
                id="logo"
                name="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
              <span className="font-sans text-[13px] text-text-secondary">
                Alterar logo
              </span>
            </div>
            {state?.error && (
              <p className="text-sm font-semibold text-terracota m-0">{state.error}</p>
            )}
            <div className="flex gap-2.5">
              <Button type="submit" size="small" disabled={pending}>
                {pending ? "Salvando..." : "Salvar"}
              </Button>
              <Button
                type="button"
                variant="tertiary"
                size="small"
                onClick={() => setEditando(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
          <div className="px-4 py-3.5 flex justify-between items-center border-b border-border-subtle">
            <span className="font-sans text-sm text-text-primary">Nome do criatório</span>
            <span className="font-sans text-sm text-text-secondary">{tenant.name}</span>
          </div>
          <div className="px-4 py-3.5 flex justify-between items-center border-b border-border-subtle">
            <span className="font-sans text-sm text-text-primary">Logo</span>
            <button
              type="button"
              onClick={() => setEditando(true)}
              className="bg-transparent border-none font-sans font-bold text-sm text-oliva-600 cursor-pointer p-0"
            >
              Alterar
            </button>
          </div>
          <div className="px-4 py-3.5 flex justify-between items-center">
            <span className="font-sans text-sm text-text-primary">Foco de criação</span>
            <span className="font-sans text-sm text-text-secondary">
              {tenant.focus || "Não informado"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function PreferenciasSection({
  alertasAtivadosInicial,
}: {
  alertasAtivadosInicial: boolean;
}) {
  const [alertasAtivados, setAlertasAtivados] = useState(alertasAtivadosInicial);
  const [isPending, startTransition] = useTransition();
  const [notificacoesEmail, setNotificacoesEmail] = useState(false);

  function handleAlertasChange(novoValor: boolean) {
    setAlertasAtivados(novoValor);
    startTransition(async () => {
      await updateAlertasConsanguinidadeAction(novoValor);
    });
  }

  return (
    <div>
      <div className="font-sans font-bold text-[11px] tracking-[0.06em] uppercase text-text-muted mb-2.5">
        Preferências
      </div>
      <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
        <div className="px-4 py-3.5 flex justify-between items-center border-b border-border-subtle">
          <span className="font-sans text-sm text-text-primary">
            Alertas de consanguinidade
          </span>
          <Toggle
            checked={alertasAtivados}
            onChange={handleAlertasChange}
            disabled={isPending}
            aria-label="Alertas de consanguinidade"
          />
        </div>
        <div className="px-4 py-3.5 flex justify-between items-center">
          <span className="font-sans text-sm text-text-primary">
            Notificações por e-mail
          </span>
          <Toggle
            checked={notificacoesEmail}
            onChange={setNotificacoesEmail}
            aria-label="Notificações por e-mail"
          />
        </div>
      </div>
    </div>
  );
}
