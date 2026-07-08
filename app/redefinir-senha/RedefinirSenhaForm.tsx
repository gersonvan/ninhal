"use client";

import { useActionState } from "react";
import { updatePasswordAction } from "@/lib/auth/actions";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";

export default function RedefinirSenhaForm() {
  const [state, formAction, pending] = useActionState(
    updatePasswordAction,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <h1 className="font-serif font-semibold text-xl text-text-primary m-0">
        Crie uma nova senha
      </h1>
      <p className="font-sans text-sm text-text-secondary leading-normal m-0">
        Escolha uma nova senha para a sua conta. Você entrará automaticamente
        após confirmar.
      </p>
      <TextField
        id="nova-senha"
        name="password"
        type="password"
        required
        minLength={6}
        label="Nova senha"
        placeholder="Mínimo de 6 caracteres"
      />
      <TextField
        id="confirmar-senha"
        name="passwordConfirm"
        type="password"
        required
        minLength={6}
        label="Confirmar nova senha"
        placeholder="Repita a nova senha"
      />
      {state?.error && (
        <p className="text-sm font-semibold text-terracota">{state.error}</p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar nova senha"}
      </Button>
    </form>
  );
}
