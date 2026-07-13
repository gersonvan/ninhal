"use client";

import { useEffect, useState } from "react";

export interface AveCandidata {
  id: string;
  nomeApelido: string | null;
  anilha: string;
}

/**
 * Busca aves do plantel compatíveis como pai (Macho) e mãe (Fêmea) para a espécie
 * informada. `status`, se informado, restringe adicionalmente por status da ave
 * (ex: "ATIVO", usado pela Trava 1 de Ninhadas — não se aplica à seleção comum de
 * pai/mãe genealógico do Cadastro de Ave, que não filtra por status).
 */
export function useParentesCandidatos(
  especieId: string | undefined,
  status?: string,
) {
  const [pais, setPais] = useState<AveCandidata[]>([]);
  const [maes, setMaes] = useState<AveCandidata[]>([]);

  useEffect(() => {
    let cancelado = false;

    if (!especieId) {
      return () => {
        cancelado = true;
      };
    }

    const sufixoStatus = status ? `&status=${status}` : "";

    fetch(`/api/aves?especieId=${especieId}&sexo=MACHO${sufixoStatus}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: AveCandidata[]) => {
        if (!cancelado) setPais(data);
      })
      .catch(() => {
        // Falha silenciosa: a lista de candidatos a pai só fica vazia — não
        // há um estado de erro dedicado para essa prévia auxiliar do formulário.
      });

    fetch(`/api/aves?especieId=${especieId}&sexo=FEMEA${sufixoStatus}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: AveCandidata[]) => {
        if (!cancelado) setMaes(data);
      })
      .catch(() => {
        // Idem, para a lista de candidatas a mãe.
      });

    return () => {
      cancelado = true;
    };
  }, [especieId, status]);

  return { pais, maes };
}
