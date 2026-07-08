import { describe, expect, it } from "vitest";
import { formatarTempoRelativo, montarAtividadeRecente } from "./atividade";
import { saudacao } from "./saudacao";

describe("formatarTempoRelativo", () => {
  const agora = new Date("2026-07-07T15:00:00");

  it("retorna 'hoje' para o mesmo dia, mesmo em horários diferentes", () => {
    expect(formatarTempoRelativo(new Date("2026-07-07T01:00:00"), agora)).toBe(
      "hoje",
    );
  });

  it("retorna 'ontem' para o dia anterior", () => {
    expect(formatarTempoRelativo(new Date("2026-07-06T23:00:00"), agora)).toBe(
      "ontem",
    );
  });

  it("retorna a contagem de dias para datas mais antigas", () => {
    expect(formatarTempoRelativo(new Date("2026-07-03T10:00:00"), agora)).toBe(
      "4 dias atrás",
    );
  });
});

describe("montarAtividadeRecente", () => {
  const ave = (nome: string | null, anilha: string, dia: number) => ({
    nomeApelido: nome,
    anilha,
    createdAt: new Date(2026, 6, dia),
  });
  const ninhada = (cod: string, dia: number) => ({
    codNinhada: cod,
    createdAt: new Date(2026, 6, dia),
  });

  it("intercala aves e ninhadas em ordem cronológica decrescente", () => {
    const itens = montarAtividadeRecente(
      [ave("Amália", "BR-001", 1), ave(null, "BR-002", 5)],
      [ninhada("2026-12", 3)],
    );

    expect(itens.map((i) => i.titulo)).toEqual(["BR-002", "#2026-12", "Amália"]);
  });

  it("usa a anilha como título quando a ave não tem apelido", () => {
    const [item] = montarAtividadeRecente([ave(null, "BR-009", 1)], []);
    expect(item.titulo).toBe("BR-009");
  });

  it("limita a quantidade de itens retornados", () => {
    const itens = montarAtividadeRecente(
      [ave("A", "1", 1), ave("B", "2", 2), ave("C", "3", 3)],
      [ninhada("2026-01", 4), ninhada("2026-02", 5)],
      4,
    );
    expect(itens).toHaveLength(4);
    expect(itens[0].titulo).toBe("#2026-02");
  });

  it("retorna vazio quando não há atividade", () => {
    expect(montarAtividadeRecente([], [])).toEqual([]);
  });
});

describe("saudacao", () => {
  it.each([
    [5, "Bom dia"],
    [11, "Bom dia"],
    [12, "Boa tarde"],
    [17, "Boa tarde"],
    [18, "Boa noite"],
    [23, "Boa noite"],
    [0, "Boa noite"],
    [4, "Boa noite"],
  ])("às %i horas retorna %s", (hora, esperado) => {
    expect(saudacao(hora)).toBe(esperado);
  });
});
