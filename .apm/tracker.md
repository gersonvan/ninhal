---
title: Ninhal
---

# APM Tracker

## Task Tracking

**Stage 1:** Complete

**Stage 2:** Complete

**Stage 3:** Complete

**Stage 4:** Complete

**Stage 5:**

| Task | Status | Agent | Branch |
|------|--------|-------|--------|
| 5.1 | Done | fullstack-agent | feat/configuracoes-conta |
| 5.2 | Done | fullstack-agent | feat/configuracoes-conta |
| 5.3 | Done | fullstack-agent | feat/configuracoes-conta |
| 5.4 | Active | fullstack-agent | feat/deploy-final-checklist |

## Worker Tracking

| Agent | Instance | Notes |
|-------|----------|-------|
| fullstack-agent | 1 | |

## Version Control

| Repository | Base Branch | Branch Convention | Commit Convention |
|-----------|-------------|-------------------|-------------------|
| ninhal | main | `tipo/descricao-curta` (feat, fix, refactor, docs, test, chore) | `tipo: descrição` |

## Working Notes

- Repositório remoto `origin` configurado em `https://github.com/gersonvan/ninhal.git`; pushes somente quando explicitamente solicitados pelo usuário.
- Confirmação de e-mail obrigatória do Supabase Auth foi desabilitada pelo usuário e verificada via teste real de cadastro — resolvido, não bloqueia mais a Stage 5 (testes E2E). Regra permanece ativa no CLAUDE.md para usar e-mails reais em testes de cadastro.
- Suíte E2E (Playwright, `e2e/fluxo-completo.spec.ts`) aceita como validada: os 7 testes passaram individualmente contra produção real, mas nunca todos juntos na mesma rodada (contenção transitória do pool do Supabase, não erro de lógica). Por decisão do usuário, rodar a suíte completa de novo sempre que uma próxima melhoria/funcionalidade for adicionada ao projeto.
- Ambiente de testes (Vitest/E2E) compartilha o mesmo banco/pool do Supabase com produção — causa raiz da contenção acima. Usuário decidiu adiar a separação de ambientes para depois do MVP (exigiria um projeto Supabase dedicado a testes, com credencial nova).
- Catálogo de `Especie` em produção estava vazio (só continha lixo de testes anteriores, removido) — semeado com a lista inicial do Spec (Canário Belga, Calopsita, Periquito Australiano) antes do lançamento final.
- Usuário trouxe materiais de referência de uma ferramenta concorrente (MyBirds) — salvos em `design/referencias-externas/` (não fazem parte do design aprovado). Mostram um formato de "carteira" compacta e uma árvore de 5 gerações (vs. as 3 gerações do Spec atual). Nenhuma decisão de escopo tomada; só relevante se o usuário quiser discutir extensões futuras do pedigree.
- Políticas de RLS do bucket `fotos-aves` corrigidas e verificadas (upload autenticado + leitura pública funcionando via teste real). Não há policy de DELETE — fora do escopo atual, considerar se um recurso de remoção de foto for adicionado no futuro. As policies do bucket `logos` (Onboarding, Stage 1) ainda não foram re-verificadas com o mesmo teste real — considerar checar se surgir algum problema relatado de upload de logo.

