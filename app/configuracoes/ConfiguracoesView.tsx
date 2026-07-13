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
import Link from "next/link";
import { criarEspecie, type EspecieResumo } from "@/lib/especies/client";
import { redimensionarFoto, validarTamanhoFoto } from "@/lib/aves/foto";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import Toggle from "@/components/ui/Toggle";

export default function ConfiguracoesView({
  user,
  tenant,
  alertasAtivadosInicial,
  especiesIniciais,
}: {
  user: User;
  tenant: Tenant;
  alertasAtivadosInicial: boolean;
  especiesIniciais: EspecieResumo[];
}) {
  return (
    <div className="max-w-[640px] mx-auto px-5 pt-5 pb-6 flex flex-col gap-5">
      <h1 className="font-serif font-semibold text-2xl text-text-primary m-0">
        Configurações
      </h1>

      <PerfilCard user={user} />
      <CriatorioSection tenant={tenant} />
      <EspeciesSection especiesIniciais={especiesIniciais} />

      <div>
        <div className="font-sans font-bold text-[11px] tracking-[0.06em] uppercase text-text-muted mb-2.5">
          Plantel
        </div>
        <Link
          href="/configuracoes/importar-ibama"
          className="no-underline bg-surface border border-border rounded-[14px] px-4 py-3.5 flex justify-between items-center"
        >
          <span className="font-sans text-sm text-text-primary">
            Importar do IBAMA
          </span>
          <span className="font-sans font-bold text-sm text-oliva-600">Importar</span>
        </Link>
      </div>

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
  const [logoErro, setLogoErro] = useState<string | null>(null);
  const [otimizandoLogo, setOtimizandoLogo] = useState(false);
  const [state, formAction, pending] = useActionState(updateCriatorioAction, null);

  async function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setLogoErro(null);
      setLogoPreview(null);
      return;
    }

    setOtimizandoLogo(true);
    const otimizado = await redimensionarFoto(file);
    setOtimizandoLogo(false);

    const erro = validarTamanhoFoto(otimizado);
    if (erro) {
      setLogoErro(erro);
      event.target.value = "";
      return;
    }

    const transferencia = new DataTransfer();
    transferencia.items.add(otimizado);
    event.target.files = transferencia.files;

    setLogoErro(null);
    setLogoPreview(URL.createObjectURL(otimizado));
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
            <TextField
              name="telefone"
              label="Telefone"
              type="tel"
              defaultValue={tenant.telefone ?? ""}
              placeholder="Ex: (11) 91234-5678"
            />
            <div className="flex items-center gap-3">
              <label
                htmlFor="logo"
                className="w-16 h-16 rounded-full border-[1.5px] border-dashed border-input-border bg-white flex items-center justify-center text-text-muted text-[11px] cursor-pointer overflow-hidden shrink-0 text-center"
              >
                {otimizandoLogo ? (
                  "..."
                ) : logoPreview || tenant.logoUrl ? (
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
                {otimizandoLogo ? "Otimizando…" : "Alterar logo"}
              </span>
            </div>
            {logoErro && (
              <p className="text-sm font-semibold text-terracota m-0">{logoErro}</p>
            )}
            {state?.error && (
              <p className="text-sm font-semibold text-terracota m-0">{state.error}</p>
            )}
            <div className="flex gap-2.5">
              <Button type="submit" size="small" disabled={pending || otimizandoLogo}>
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
          <div className="px-4 py-3.5 flex justify-between items-center border-b border-border-subtle">
            <span className="font-sans text-sm text-text-primary">Foco de criação</span>
            <span className="font-sans text-sm text-text-secondary">
              {tenant.focus || "Não informado"}
            </span>
          </div>
          <div className="px-4 py-3.5 flex justify-between items-center">
            <span className="font-sans text-sm text-text-primary">Telefone</span>
            <span className="font-sans text-sm text-text-secondary">
              {tenant.telefone || "Não informado"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function EspeciesSection({
  especiesIniciais,
}: {
  especiesIniciais: EspecieResumo[];
}) {
  const [listaEspecies, setListaEspecies] = useState(especiesIniciais);
  const [adicionando, setAdicionando] = useState(false);
  const [nome, setNome] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleAdicionar() {
    const nomeAparado = nome.trim();
    if (!nomeAparado) return;

    setSalvando(true);
    setErro(null);
    try {
      const especie = await criarEspecie(nomeAparado);
      setListaEspecies((atual) => {
        if (atual.some((e) => e.id === especie.id)) return atual;
        return [...atual, especie].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
      });
      setNome("");
      setAdicionando(false);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível adicionar a espécie.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <div className="font-sans font-bold text-[11px] tracking-[0.06em] uppercase text-text-muted mb-2.5">
        Espécies
      </div>
      <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
        {listaEspecies.map((especie, indice) => (
          <div
            key={especie.id}
            className={`px-4 py-3.5 ${
              indice < listaEspecies.length - 1 ? "border-b border-border-subtle" : ""
            }`}
          >
            <span className="font-sans text-sm text-text-primary">{especie.nome}</span>
          </div>
        ))}
        <div className="px-4 py-3.5 border-t border-border-subtle">
          {adicionando ? (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <TextField
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome da nova espécie"
                  className="flex-1"
                />
                <Button
                  type="button"
                  size="small"
                  onClick={handleAdicionar}
                  disabled={salvando || !nome.trim()}
                >
                  {salvando ? "Adicionando..." : "Adicionar"}
                </Button>
                <Button
                  type="button"
                  variant="tertiary"
                  size="small"
                  onClick={() => {
                    setAdicionando(false);
                    setNome("");
                    setErro(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
              {erro && <p className="text-xs font-semibold text-terracota m-0">{erro}</p>}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdicionando(true)}
              className="bg-transparent border-none font-sans font-bold text-sm text-oliva-600 cursor-pointer p-0"
            >
              Adicionar espécie
            </button>
          )}
        </div>
      </div>
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
