import { randomUUID } from "node:crypto";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { buscarUsuarioIdPorEmail, excluirUsuario } from "./support/admin";
import {
  abrirConexao,
  buscarTenantPorOwnerId,
  excluirEspecies,
  fecharConexao,
  garantirEspecie,
  limparTenant,
} from "./support/db";

/**
 * Suíte E2E do fluxo completo do MVP, executada contra a URL de produção
 * recém-publicada. Roda em série porque cada teste depende do estado deixado
 * pelo anterior (mesma conta, mesmo criatório, mesmas aves).
 */
test.describe.configure({ mode: "serial" });

const sufixo = randomUUID().slice(0, 8);
const email = `gersonvan+ninhal-e2e-${sufixo}@gmail.com`;
const senha = "SenhaTeste123!";
const nomeResponsavel = `Testador E2E ${sufixo}`;
const nomeCriatorio = `Criatório E2E ${sufixo}`;

let page: Page;
let userId: string;
let tenantId: string;
let especieCanarioId: string;
let especieCalopsitaId: string;
let anilhaMachoA: string;
let anilhaFemeaB: string;
let anilhaFemeaC: string;
let idMachoA: string;
let idFemeaB: string;
let idFemeaC: string;
let idNinhada1: string;

/**
 * Clica em um elemento que dispara uma navegação real (redirect de Server
 * Action). Contra produção, o redirect por vezes acontece rápido o bastante
 * para o elemento sumir do DOM antes do `click()` do Playwright confirmar sua
 * própria conclusão — o clique já foi efetivado (confirmado via depuração
 * manual), mas a promise do `click()` rejeita por timeout. Sem o `.catch()`
 * aqui, essa rejeição vaza como unhandled rejection e derruba o teste mesmo
 * com o fluxo funcionando corretamente.
 */
async function clicarComNavegacao(
  page: Page,
  locator: Locator,
  urlPattern: string | RegExp,
) {
  locator.click().catch(() => {});
  await page.waitForURL(urlPattern, { timeout: 20000 });
}

/**
 * As Tasks compartilham uma única `page`/contexto de navegador entre si — por
 * padrão o Playwright cria uma `page` nova por `test()`, mesmo dentro de um
 * `describe.configure({ mode: "serial" })` (serial garante só a ordem, não o
 * compartilhamento de sessão). Como esta suíte depende do mesmo login em
 * todas as Tasks, a `page` é criada uma vez em `beforeAll` e reaproveitada.
 */
test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  await abrirConexao();
  const canario = await garantirEspecie(`Canário Belga (E2E ${sufixo})`);
  const calopsita = await garantirEspecie(`Calopsita (E2E ${sufixo})`);
  especieCanarioId = canario.id;
  especieCalopsitaId = calopsita.id;
});

test.afterAll(async () => {
  await page.close();
  if (tenantId) {
    await limparTenant(tenantId);
  }
  await excluirEspecies([especieCanarioId, especieCalopsitaId]);
  await fecharConexao();
  if (userId) {
    await excluirUsuario(userId);
  }
});

test("cadastro e onboarding", async () => {
  await page.goto("/login");
  // Nesse momento só a aba "Criar conta" existe com esse texto (o formulário
  // de cadastro ainda não foi renderizado), então o clique é inequívoco.
  await page.getByRole("button", { name: "Criar conta", exact: true }).click();
  await page.getByLabel("Nome completo").fill(nomeResponsavel);
  await page.locator("#signup-email").fill(email);
  await page.locator("#signup-password").fill(senha);

  // O cadastro já autentica imediatamente (sem exigir confirmação de e-mail
  // neste projeto Supabase) e vai direto para o onboarding.
  await clicarComNavegacao(
    page,
    page.getByRole("button", { name: "Criar conta", exact: true }).last(),
    "**/onboarding",
  );
  userId = await buscarUsuarioIdPorEmail(email);

  await page.getByPlaceholder("Ex: Aviário Serra Verde").fill(nomeCriatorio);
  await page.getByRole("button", { name: "Continuar" }).click();

  // "Canários" já vem pré-selecionado por padrão no wizard — não é necessário clicar.
  await page.getByRole("button", { name: "Continuar" }).click();

  await clicarComNavegacao(
    page,
    page.getByRole("button", { name: "Concluir" }),
    "**/dashboard",
  );
  await expect(page.getByText(`Bem-vindo(a), ${nomeCriatorio}`)).toBeVisible();

  const tenant = await buscarTenantPorOwnerId(userId);
  expect(tenant).not.toBeNull();
  tenantId = tenant!.id;
});

async function cadastrarAve(
  page: Page,
  {
    anilha,
    sexo,
    especieId,
    paiId,
    maeId,
  }: {
    anilha: string;
    sexo: "Macho" | "Fêmea";
    especieId: string;
    paiId?: string;
    maeId?: string;
  },
): Promise<string> {
  const params = new URLSearchParams();
  if (paiId) params.set("paiId", paiId);
  if (maeId) params.set("maeId", maeId);
  if (especieId) params.set("especieId", especieId);

  await page.goto(`/plantel/novo${params.toString() ? `?${params}` : ""}`);
  await page.locator('input[name="anilha"]').fill(anilha);
  await page.getByRole("button", { name: sexo }).click();
  if (!paiId && !maeId) {
    await page.locator('select[name="especieId"]').selectOption(especieId);
  }
  await clicarComNavegacao(
    page,
    page.getByRole("button", { name: "Salvar ave" }),
    /\/plantel\/(?!novo\b)[0-9a-zA-Z-]+$/,
  );
  return page.url().split("/plantel/")[1];
}

test("cadastro de aves no plantel", async () => {
  anilhaMachoA = `E2E-${sufixo}-A`;
  anilhaFemeaB = `E2E-${sufixo}-B`;

  idMachoA = await cadastrarAve(page, {
    anilha: anilhaMachoA,
    sexo: "Macho",
    especieId: especieCanarioId,
  });
  idFemeaB = await cadastrarAve(page, {
    anilha: anilhaFemeaB,
    sexo: "Fêmea",
    especieId: especieCanarioId,
  });

  await page.goto("/plantel");
  await page.getByPlaceholder("Buscar por nome ou anilha").fill(anilhaMachoA);
  // A busca é debounced (300ms) antes de refazer a consulta. O texto aparece
  // duas vezes no card (título e anilha em mono), daí o .first().
  await expect(page.getByText(anilhaMachoA).first()).toBeVisible({ timeout: 10000 });
});

test("criação de ninhada — Trava 1 (só reprodutores compatíveis)", async () => {
  // Ave de outra espécie: não pode aparecer como candidata a reprodutora do casal Canário.
  const idCalopsitaC = await cadastrarAve(page, {
    anilha: `E2E-${sufixo}-CALOPSITA`,
    sexo: "Fêmea",
    especieId: especieCalopsitaId,
  });

  await page.goto("/ninhadas/novo");
  await page.locator("select").first().selectOption(especieCanarioId);

  const selectMacho = page.locator("select").nth(1);
  const selectFemea = page.locator("select").nth(2);

  await expect(selectMacho.locator("option", { hasText: anilhaMachoA })).toHaveCount(1, {
    timeout: 10000,
  });
  await expect(selectFemea.locator("option", { hasText: anilhaFemeaB })).toHaveCount(1, {
    timeout: 10000,
  });
  // A fêmea de outra espécie não deve aparecer entre as candidatas do casal Canário.
  await expect(selectFemea.locator(`option[value="${idCalopsitaC}"]`)).toHaveCount(0);
});

test("criação de ninhada — Trava 2 (sem parentesco) e acompanhamento", async () => {
  await page.goto("/ninhadas/novo");
  await page.locator("select").first().selectOption(especieCanarioId);
  await page.locator("select").nth(1).selectOption(idMachoA);
  await page.locator("select").nth(2).selectOption(idFemeaB);

  await expect(
    page.getByText("Nenhum parentesco direto encontrado"),
  ).toBeVisible({ timeout: 10000 });

  await page.locator('input[name="dataPostura"]').fill("2026-06-01");
  await clicarComNavegacao(
    page,
    page.getByRole("button", { name: "Confirmar ninhada" }),
    /\/ninhadas\/(?!novo\b)[0-9a-zA-Z-]+$/,
  );
  idNinhada1 = page.url().split("/ninhadas/")[1];

  await page.getByRole("button", { name: "Atualizar acompanhamento" }).click();
  await page.locator('input[name="ovosBotados"]').fill("6");
  await page.locator('input[name="ovosFerteis"]').fill("5");
  await page.locator('input[name="filhotesNascidos"]').fill("4");
  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Taxa de eclosão")).toBeVisible();
  await expect(page.getByText("67%")).toBeVisible();
});

test("gerar filhote e criar ninhada — Trava 2 (alerta de consanguinidade)", async () => {
  anilhaFemeaC = `E2E-${sufixo}-C`;
  await page.goto(`/ninhadas/${idNinhada1}`);
  await clicarComNavegacao(
    page,
    page.getByRole("link", { name: "Gerar filhotes na árvore" }),
    /\/plantel\/novo/,
  );

  await page.locator('input[name="anilha"]').fill(anilhaFemeaC);
  await page.getByRole("button", { name: "Fêmea" }).click();
  await clicarComNavegacao(
    page,
    page.getByRole("button", { name: "Salvar ave" }),
    /\/plantel\/(?!novo\b)[0-9a-zA-Z-]+$/,
  );
  idFemeaC = page.url().split("/plantel/")[1];

  // Casal pai × filha: deve disparar o alerta de consanguinidade (25%).
  await page.goto("/ninhadas/novo");
  await page.locator("select").first().selectOption(especieCanarioId);
  await page.locator("select").nth(1).selectOption(idMachoA);
  await page.locator("select").nth(2).selectOption(idFemeaC);

  await expect(page.getByText("Atenção: risco de consanguinidade")).toBeVisible({
    timeout: 10000,
  });
  await expect(page.getByText(/Coeficiente de parentesco estimado: 25%/)).toBeVisible();
});

test("consulta da árvore genealógica com navegação entre gerações", async () => {
  await page.goto(`/arvore/${idFemeaC}`);
  await expect(page.getByText("Árvore genealógica")).toBeVisible();
  // As aves de teste não têm apelido, então o título do card cai para a
  // própria anilha — o mesmo texto aparece duas vezes no card (título e
  // anilha em mono), daí o .first().
  await expect(page.getByText(anilhaMachoA).first()).toBeVisible();
  await expect(page.getByText(anilhaFemeaB).first()).toBeVisible();

  await clicarComNavegacao(
    page,
    page.getByText(anilhaMachoA).first(),
    `**/arvore/${idMachoA}`,
  );
  await expect(page.getByText(`Linhagem de ${anilhaMachoA}`)).toBeVisible();
});

test("exportação do pedigree em PDF", async () => {
  await page.goto(`/plantel/${idFemeaC}/pedigree`);
  await expect(page.getByText("Certificado de Pedigree")).toBeVisible();
  // O nome do criatório aparece tanto no cabeçalho quanto no rodapé (responsável técnico).
  await expect(page.getByText(nomeCriatorio).first()).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Exportar PDF" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/pedigree-.*\.pdf/);
});
