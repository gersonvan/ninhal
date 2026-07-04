import { describe, expect, it } from "vitest";
import {
  construirArvoreGenealogica,
  type AveAncestralNode,
} from "./construir";

function ave(
  id: string,
  overrides: Partial<AveAncestralNode> = {},
): AveAncestralNode {
  return {
    id,
    nomeApelido: id,
    anilha: `BR-${id}`,
    sexo: "NAO_SEXADO",
    origem: "NASCIDA_NO_CRIATORIO",
    paiAve: null,
    maeAve: null,
    ...overrides,
  };
}

describe("construirArvoreGenealogica", () => {
  it("monta a árvore completa quando todos os ancestrais são conhecidos", () => {
    const avoPP = ave("avo-pai-pai");
    const avoPM = ave("avo-pai-mae");
    const avoMP = ave("avo-mae-pai");
    const avoMM = ave("avo-mae-mae");
    const pai = ave("pai", { paiAve: avoPP, maeAve: avoPM });
    const mae = ave("mae", { paiAve: avoMP, maeAve: avoMM });
    const principal = ave("principal", { paiAve: pai, maeAve: mae });

    const arvore = construirArvoreGenealogica(principal);

    expect(arvore.ave).toEqual({
      conhecido: true,
      id: "principal",
      nomeApelido: "principal",
      anilha: "BR-principal",
      sexo: "NAO_SEXADO",
      origem: "NASCIDA_NO_CRIATORIO",
    });
    expect(arvore.pai).toMatchObject({ conhecido: true, id: "pai" });
    expect(arvore.mae).toMatchObject({ conhecido: true, id: "mae" });
    expect(arvore.paiDoPai).toMatchObject({ conhecido: true, id: "avo-pai-pai" });
    expect(arvore.maeDoPai).toMatchObject({ conhecido: true, id: "avo-pai-mae" });
    expect(arvore.paiDaMae).toMatchObject({ conhecido: true, id: "avo-mae-pai" });
    expect(arvore.maeDaMae).toMatchObject({ conhecido: true, id: "avo-mae-mae" });
  });

  it("rotula ancestrais nunca vinculados como 'Não registrado/a'", () => {
    const principal = ave("principal"); // sem pai nem mãe vinculados

    const arvore = construirArvoreGenealogica(principal);

    expect(arvore.pai).toEqual({
      conhecido: false,
      motivo: "NAO_REGISTRADO",
      label: "Não registrado",
    });
    expect(arvore.mae).toEqual({
      conhecido: false,
      motivo: "NAO_REGISTRADO",
      label: "Não registrada",
    });
    // Sem pai/mãe conhecidos, os avós também são "Não registrado/a" (não há
    // razão conhecida para a ausência, então não presume "adquirido").
    expect(arvore.paiDoPai).toEqual({
      conhecido: false,
      motivo: "NAO_REGISTRADO",
      label: "Não registrado",
    });
    expect(arvore.maeDaMae).toEqual({
      conhecido: false,
      motivo: "NAO_REGISTRADO",
      label: "Não registrada",
    });
  });

  it("monta uma árvore parcial (um lado completo, outro totalmente ausente)", () => {
    const avoPP = ave("avo-pai-pai");
    const avoPM = ave("avo-pai-mae");
    const pai = ave("pai", { paiAve: avoPP, maeAve: avoPM });
    const principal = ave("principal", { paiAve: pai, maeAve: null });

    const arvore = construirArvoreGenealogica(principal);

    expect(arvore.pai).toMatchObject({ conhecido: true, id: "pai" });
    expect(arvore.paiDoPai).toMatchObject({ conhecido: true, id: "avo-pai-pai" });
    expect(arvore.maeDoPai).toMatchObject({ conhecido: true, id: "avo-pai-mae" });

    expect(arvore.mae).toEqual({
      conhecido: false,
      motivo: "NAO_REGISTRADO",
      label: "Não registrada",
    });
    expect(arvore.paiDaMae).toEqual({
      conhecido: false,
      motivo: "NAO_REGISTRADO",
      label: "Não registrado",
    });
    expect(arvore.maeDaMae).toEqual({
      conhecido: false,
      motivo: "NAO_REGISTRADO",
      label: "Não registrada",
    });
  });

  it("rotula os avós como 'Adquirido/a — sem registro' quando o pai tem origem Adquirida", () => {
    const pai = ave("pai", { origem: "ADQUIRIDA", paiAve: null, maeAve: null });
    const mae = ave("mae", { origem: "NASCIDA_NO_CRIATORIO", paiAve: null, maeAve: null });
    const principal = ave("principal", { paiAve: pai, maeAve: mae });

    const arvore = construirArvoreGenealogica(principal);

    expect(arvore.pai).toMatchObject({ conhecido: true, id: "pai", origem: "ADQUIRIDA" });

    // Avós paternos: pai foi adquirido, então seus pais nunca existirão no sistema.
    expect(arvore.paiDoPai).toEqual({
      conhecido: false,
      motivo: "ADQUIRIDO_SEM_REGISTRO",
      label: "Adquirido — sem registro",
    });
    expect(arvore.maeDoPai).toEqual({
      conhecido: false,
      motivo: "ADQUIRIDO_SEM_REGISTRO",
      label: "Adquirida — sem registro",
    });

    // Avós maternos: mãe nasceu no criatório mas não tem pais vinculados —
    // apenas "não registrado", já que não há razão conhecida.
    expect(arvore.paiDaMae).toEqual({
      conhecido: false,
      motivo: "NAO_REGISTRADO",
      label: "Não registrado",
    });
    expect(arvore.maeDaMae).toEqual({
      conhecido: false,
      motivo: "NAO_REGISTRADO",
      label: "Não registrada",
    });
  });

  it("rotula os próprios pais como 'Adquirido/a — sem registro' quando a ave principal foi adquirida", () => {
    const principal = ave("principal", {
      origem: "ADQUIRIDA",
      paiAve: null,
      maeAve: null,
    });

    const arvore = construirArvoreGenealogica(principal);

    expect(arvore.pai).toEqual({
      conhecido: false,
      motivo: "ADQUIRIDO_SEM_REGISTRO",
      label: "Adquirido — sem registro",
    });
    expect(arvore.mae).toEqual({
      conhecido: false,
      motivo: "ADQUIRIDO_SEM_REGISTRO",
      label: "Adquirida — sem registro",
    });
  });
});
