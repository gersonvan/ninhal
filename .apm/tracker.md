---
title: Ninhal
---

# APM Tracker

## Task Tracking

**Stage 1:** Complete

**Stage 2:** Complete

**Stage 3:**

| Task | Status | Agent | Branch |
|------|--------|-------|--------|
| 3.1 | Done | fullstack-agent | feat/ninhadas-modelo-api |
| 3.2 | Done | fullstack-agent | feat/ninhadas-modelo-api |
| 3.3 | Active | fullstack-agent | feat/ninhadas-modelo-api |
| 3.4 | Done | fullstack-agent | feat/ninhadas-modelo-api |
| 3.5 | Done | fullstack-agent | feat/ninhadas-modelo-api |
| 3.6 | Active | fullstack-agent | feat/ninhadas-modelo-api |

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

