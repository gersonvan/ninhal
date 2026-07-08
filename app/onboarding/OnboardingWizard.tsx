"use client";

import { useActionState, useState } from "react";
import { completeOnboardingAction } from "@/lib/onboarding/actions";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";

const SPECIES = [
  { name: "Canários", emoji: "🐤" },
  { name: "Calopsitas", emoji: "🦜" },
  { name: "Psitacídeos", emoji: "🦚" },
  { name: "Silvestres", emoji: "🦅" },
  { name: "Outras aves ornamentais", emoji: "🐦" },
];

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState<
    Record<string, boolean>
  >({ Canários: true });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(
    completeOnboardingAction,
    null,
  );

  const focus = Object.entries(selectedSpecies)
    .filter(([, checked]) => checked)
    .map(([species]) => species)
    .join(", ");

  function toggleSpecies(species: string) {
    setSelectedSpecies((prev) => ({ ...prev, [species]: !prev[species] }));
  }

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setLogoPreview(null);
      return;
    }
    setLogoPreview(URL.createObjectURL(file));
  }

  function handleNext() {
    if (step < 4) {
      setStep(step + 1);
    }
  }

  function handleBack() {
    setStep(Math.max(1, step - 1));
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 box-border bg-background">
      <div className="w-full max-w-[460px] flex flex-col gap-6">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="flex-1 h-[5px] rounded-full"
              style={{ background: n <= step ? "#4B5D3A" : "#E4DCC8" }}
            />
          ))}
        </div>

        <form action={formAction} className="flex flex-col gap-6">
          <input type="hidden" name="name" value={name} />
          <input type="hidden" name="focus" value={focus} />

          {step === 1 && (
            <div className="flex flex-col gap-2">
              <div className="font-sans font-bold text-xs tracking-[0.06em] uppercase text-[#8B6A2F]">
                Passo 1 de 4
              </div>
              <h1 className="font-serif font-semibold text-[28px] text-text-primary m-0">
                Como se chama seu criatório?
              </h1>
              <p className="font-sans text-sm text-text-secondary m-0 mb-2 leading-normal">
                Esse nome aparece no seu pedigree e nos documentos
                compartilhados com clientes.
              </p>
              <TextField
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Aviário Serra Verde"
                className="text-base py-[15px]"
              />
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-2">
              <div className="font-sans font-bold text-xs tracking-[0.06em] uppercase text-[#8B6A2F]">
                Passo 2 de 4
              </div>
              <h1 className="font-serif font-semibold text-[28px] text-text-primary m-0">
                Qual seu foco de criação?
              </h1>
              <p className="font-sans text-sm text-text-secondary m-0 mb-2">
                Pode escolher mais de uma. Isso ajusta os campos do seu
                plantel.
              </p>
              <div className="flex flex-col gap-2.5">
                {SPECIES.map(({ name: species, emoji }) => {
                  const selected = Boolean(selectedSpecies[species]);
                  return (
                    <button
                      key={species}
                      type="button"
                      onClick={() => toggleSpecies(species)}
                      className={`flex items-center gap-3 text-left font-sans font-bold text-[15px] px-[18px] py-4 rounded-xl cursor-pointer text-text-primary ${
                        selected
                          ? "bg-[#DCE5D2] border-[1.5px] border-oliva-600"
                          : "bg-white border-[1.5px] border-border"
                      }`}
                    >
                      <span>{emoji}</span>
                      <span className="flex-1">{species}</span>
                      {selected && (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#4B5D3A"
                          strokeWidth={3}
                        >
                          <path d="M5 12l5 5L20 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-2">
              <div className="font-sans font-bold text-xs tracking-[0.06em] uppercase text-[#8B6A2F]">
                Passo 3 de 4
              </div>
              <h1 className="font-serif font-semibold text-[28px] text-text-primary m-0">
                Adicione o logo do seu criatório
              </h1>
              <p className="font-sans text-sm text-text-secondary m-0 mb-2">
                Ele será usado no pedigree exportável. Pode pular e adicionar
                depois.
              </p>
              <div className="flex justify-center py-3">
                <label
                  htmlFor="logo"
                  className="w-40 h-40 rounded-full border-[1.5px] border-dashed border-input-border bg-white flex items-center justify-center text-text-muted text-sm cursor-pointer overflow-hidden"
                >
                  {logoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoPreview}
                      alt="Pré-visualização do logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    "Toque para escolher"
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
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-2">
              <div className="font-sans font-bold text-xs tracking-[0.06em] uppercase text-[#8B6A2F]">
                Passo 4 de 4
              </div>
              <h1 className="font-serif font-semibold text-[28px] text-text-primary m-0">
                Já tem seu plantel registrado no IBAMA?
              </h1>
              <p className="font-sans text-sm text-text-secondary m-0 mb-2 leading-normal">
                Você pode importar sua Relação de Passeriformes agora e
                cadastrar suas aves automaticamente, ou pular e fazer isso
                depois em Configurações.
              </p>
            </div>
          )}

          {state?.error && (
            <p className="text-sm font-semibold text-terracota">
              {state.error}
            </p>
          )}

          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant="tertiary"
              onClick={handleBack}
              className="!text-text-secondary"
              style={{ visibility: step === 1 ? "hidden" : "visible" }}
            >
              Voltar
            </Button>
            {step < 4 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={step === 1 && name.trim().length === 0}
                className="flex-1"
              >
                Continuar
              </Button>
            ) : (
              <>
                <Button
                  type="submit"
                  name="redirecionarPara"
                  value="dashboard"
                  variant="secondary"
                  disabled={pending}
                  className="flex-1"
                >
                  {pending ? "Concluindo..." : "Pular por agora"}
                </Button>
                <Button
                  type="submit"
                  name="redirecionarPara"
                  value="importar-ibama"
                  disabled={pending}
                  className="flex-1"
                >
                  {pending ? "Concluindo..." : "Importar do IBAMA"}
                </Button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
