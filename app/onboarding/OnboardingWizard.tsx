"use client";

import { useActionState, useState } from "react";
import { completeOnboardingAction } from "@/lib/onboarding/actions";

const SPECIES = [
  { name: "Canários", emoji: "🐤" },
  { name: "Calopsitas", emoji: "🦜" },
  { name: "Psitacídeos", emoji: "🦚" },
  { name: "Outras aves ornamentais", emoji: "🐦" },
];

const inputClass =
  "font-sans text-base px-4 py-[15px] rounded-[10px] border-[1.5px] border-input-border bg-white text-text-primary";

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
    if (step < 3) {
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
          {[1, 2, 3].map((n) => (
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
                Passo 1 de 3
              </div>
              <h1 className="font-serif font-semibold text-[28px] text-text-primary m-0">
                Como se chama seu criatório?
              </h1>
              <p className="font-sans text-sm text-text-secondary m-0 mb-2 leading-normal">
                Esse nome aparece no seu pedigree e nos documentos
                compartilhados com clientes.
              </p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Aviário Serra Verde"
                className={inputClass}
              />
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-2">
              <div className="font-sans font-bold text-xs tracking-[0.06em] uppercase text-[#8B6A2F]">
                Passo 2 de 3
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
                Passo 3 de 3
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
                    "Arraste o logo"
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

          {state?.error && (
            <p className="text-sm font-semibold text-terracota">
              {state.error}
            </p>
          )}

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={handleBack}
              className="font-sans font-bold text-[15px] bg-transparent text-text-secondary border-none px-2.5 py-[15px] cursor-pointer"
              style={{ visibility: step === 1 ? "hidden" : "visible" }}
            >
              Voltar
            </button>
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={step === 1 && name.trim().length === 0}
                className="flex-1 font-sans font-bold text-[15px] bg-oliva-600 text-background border-none px-4 py-[15px] rounded-[10px] cursor-pointer disabled:opacity-60"
              >
                Continuar
              </button>
            ) : (
              <button
                type="submit"
                disabled={pending}
                className="flex-1 font-sans font-bold text-[15px] bg-oliva-600 text-background border-none px-4 py-[15px] rounded-[10px] cursor-pointer disabled:opacity-70"
              >
                {pending ? "Concluindo..." : "Concluir"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
