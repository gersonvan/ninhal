"use client";

import { useEffect, useState } from "react";

export interface AveCandidata {
  id: string;
  nomeApelido: string | null;
  anilha: string;
}

/** Busca aves do plantel compatíveis como pai (Macho) e mãe (Fêmea) para a espécie informada. */
export function useParentesCandidatos(especieId: string | undefined) {
  const [pais, setPais] = useState<AveCandidata[]>([]);
  const [maes, setMaes] = useState<AveCandidata[]>([]);

  useEffect(() => {
    let cancelado = false;

    if (!especieId) {
      return () => {
        cancelado = true;
      };
    }

    fetch(`/api/aves?especieId=${especieId}&sexo=MACHO`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: AveCandidata[]) => {
        if (!cancelado) setPais(data);
      });

    fetch(`/api/aves?especieId=${especieId}&sexo=FEMEA`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: AveCandidata[]) => {
        if (!cancelado) setMaes(data);
      });

    return () => {
      cancelado = true;
    };
  }, [especieId]);

  return { pais, maes };
}
