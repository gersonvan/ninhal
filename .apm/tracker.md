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
| 5.2 | Active | fullstack-agent | feat/configuracoes-conta |
| 5.3 | Active | fullstack-agent | feat/configuracoes-conta |
| 5.4 | Waiting: 5.3 | fullstack-agent | |

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
- Políticas de RLS do bucket `fotos-aves` corrigidas e verificadas (upload autenticado + leitura pública funcionando via teste real). Não há policy de DELETE — fora do escopo atual, considerar se um recurso de remoção de foto for adicionado no futuro. As policies do bucket `logos` (Onboarding, Stage 1) ainda não foram re-verificadas com o mesmo teste real — considerar checar se surgir algum problema relatado de upload de logo.

