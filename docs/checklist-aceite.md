# Checklist de Aceite — Ninhal (MVP)

Verificação final do escopo completo do MVP contra a URL pública de produção: **https://plantelboard.vercel.app**

Verificado em: 06/07/2026 (deploy `dpl_H3iV6pXnoUp3QkgTN7x3FXHkpu3D`, branch `main`, commit `7ba4c78`).

| Item do escopo | Status | Como foi verificado |
|---|---|---|
| Cadastro Geral de aves (com foto) | ✅ Funcional (upload de foto não reexecutado via automação — ver observação abaixo) | Cadastro real de duas aves (macho e fêmea, Canário Belga) através da interface, com nome, anilha, sexo, espécie, origem e genealogia; confirmado no Plantel e na Ficha da Ave. |
| Reprodução/Ninhadas com Travas 1 e 2 | ✅ Funcional | Criação de uma ninhada real entre as duas aves cadastradas. Trava 1 confirmada: os campos de Macho/Fêmea só listam aves da mesma espécie e sexo compatível (nenhuma outra ave apareceu nas opções). Trava 2 confirmada: o casal sem parentesco exibiu corretamente "Nenhum parentesco direto encontrado". |
| Árvore Genealógica navegável (3 gerações) | ✅ Funcional | Árvore da ave cadastrada renderizou as 3 gerações (avós, pais, ave selecionada), com os ancestrais desconhecidos corretamente indicados como "Não registrado/a". Navegação por clique entre gerações já validada extensivamente na suíte E2E (Task 5.3). |
| Pedigree exportável em PDF | ✅ Funcional | Tela de exportação de pedigree renderizou o certificado completo (criatório, ave, árvore, código de verificação) com os dados reais cadastrados nesta verificação. |
| Autenticação de usuários | ✅ Funcional | Cadastro de uma conta real (e-mail `gersonvan+ninhal-aceite@gmail.com`) autenticou imediatamente e prosseguiu para o onboarding — sem bloqueio de confirmação de e-mail (achado da Task 5.3: a exigência de confirmação documentada nas Tasks 1.2/1.3 não existe mais). |
| Multi-tenancy (isolamento de dados por conta) | ✅ Funcional | Coberto extensivamente pela suíte de testes automatizados (`lib/tenant/*.test.ts`, `lib/aves/service.test.ts` e outros), que validam o isolamento por tenant do middleware do Prisma em cenários com múltiplos tenants. Não é uma funcionalidade observável isoladamente pela UI além do que os testes já cobrem. |
| Aplicação publicamente acessível | ✅ Funcional | Todas as rotas testadas diretamente contra a URL pública via HTTP: `/login` responde 200; `/onboarding`, `/dashboard`, `/plantel`, `/ninhadas`, `/configuracoes` respondem 307 (redirecionamento correto para `/login` quando não autenticado). |
| Testes automatizados (unitários e ponta a ponta) | ✅ Presentes e executáveis | `npx vitest run`: 99/100 testes passando (uma falha intermitente de `EMAXCONNSESSION`, categoria de contenção do pooler já documentada em Stages anteriores — não re-executada até 100% limpa, conforme instruído). Suíte E2E Playwright existe em `e2e/fluxo-completo.spec.ts` e já teve cada um dos seus 7 testes validados individualmente contra produção na Task 5.3 — não reexecutada nesta Task, conforme instruído. |
| Notas de uso (documentação para o usuário final) | ✅ Presente | `docs/guia-de-uso.md`, cobrindo cadastro/onboarding, cadastro de aves, ninhadas (com as travas), árvore genealógica, exportação de pedigree e configurações. |

## Observações

- **Upload de foto**: a ferramenta de automação de navegador usada nesta verificação não consegue simular a seleção de um arquivo real em um campo `<input type="file">` (restrição de segurança do navegador, não do produto). O campo de upload está presente e funcional na interface; o caminho de código (upload para o Supabase Storage) não mudou desde a Stage 2 e não há indício de regressão. Recomendo uma confirmação humana pontual do upload real, se possível antes da revisão externa.
- **Dados de teste**: a conta, o criatório, as duas aves e a ninhada criados durante esta verificação foram removidos ao final (usuário do Supabase Auth e registros de domínio no banco), conforme instruído.
- **Multi-tenancy**: por não ter um segundo tenant de teste criado propositalmente nesta verificação, a confirmação direta de isolamento nesta Task se apoia na cobertura já existente da suíte automatizada, que testa esse comportamento explicitamente (criação de dois tenants e verificação de que um não enxerga dados do outro).
