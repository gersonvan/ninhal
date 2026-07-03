---
title: Ninhal
---

# APM Tracker

## Task Tracking

**Stage 1:** Complete

**Stage 2:**

| Task | Status | Agent | Branch |
|------|--------|-------|--------|
| 2.1 | Ready | fullstack-agent | |
| 2.2 | Waiting: 2.1 | fullstack-agent | |
| 2.3 | Waiting: 2.1 | fullstack-agent | |
| 2.4 | Waiting: 2.1 | fullstack-agent | |

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
- Convenção `TENANT_SCOPED_MODELS` (`lib/tenant/scoped-models.ts`) exige registro manual de toda tabela de domínio tenant-scoped — incluir instrução explícita na Task 2.1 (modelo de Ave) para registrar o novo modelo nessa lista.
- Políticas de RLS do bucket de Storage `logos` (upload de logo) não foram verificadas — mesmo cuidado se aplica ao upload de fotos de aves na Task 2.3.
- Usuário vai desabilitar manualmente a confirmação de e-mail obrigatória no painel do Supabase Auth (Authentication > Sign In / Providers > Email) — verificar se foi feito antes da Stage 5 (testes E2E). Supabase sinalizou taxa alta de bounce por e-mails de teste inválidos — Rule adicionada ao CLAUDE.md para usar e-mails reais em testes de cadastro daqui em diante.

