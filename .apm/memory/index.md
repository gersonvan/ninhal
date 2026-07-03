---
title: Ninhal
---

# APM Memory Index

## Memory Notes

- Prisma 7 removeu o middleware `$use` e o `Prisma.dmmf` público no client gerado; `PrismaClient` exige um adapter de driver explícito (`@prisma/adapter-pg`). O isolamento multi-tenant é aplicado via `$extends` sobre uma lista manual de modelos (`lib/tenant/scoped-models.ts`, `TENANT_SCOPED_MODELS`) — toda tabela de domínio nova (Ave, Ninhada) precisa ser registrada manualmente nessa lista além de ganhar o campo `tenantId`; não há detecção automática.
- A conexão do Prisma com o Supabase só funciona neste ambiente via connection pooler (Supavisor) — o host de conexão direta resolve apenas por IPv6, inalcançável na rede local. Qualquer nova configuração de ambiente (local, CI, deploy) deve usar a string do pooler.
- Cadastros de teste contra o projeto Supabase devem usar e-mails reais e entregáveis (ex: alias `+` em um endereço real) — o projeto recebeu aviso de alta taxa de bounce por testes com endereços fabricados, com risco de restrição do envio de e-mails. Regra registrada em CLAUDE.md.
- A confirmação de e-mail obrigatória do Supabase Auth segue ativa (usuário vai desabilitar manualmente no painel) — verificar se foi resolvido antes de despachar a Task de testes E2E (Stage 5), já que bloqueia login imediato após cadastro.
- Políticas de RLS do bucket de Storage `logos` não foram verificadas após a criação do bucket — mesma verificação vale para qualquer upload de foto de ave (Cadastro Geral).

## Stage Summaries

### Stage 1 - Fundação Técnica e Autenticação

Stage concluída com as 5 Tasks executadas sequencialmente pelo Fullstack Agent (instância única, sem Handoffs) na branch `feat/setup-multitenancy-onboarding`, mergeada para `main` ao final da Stage (repositório git inicializado nesta Stage; base branch não tinha commits prévios, então o merge foi direto). Entregou: scaffold Next.js/TypeScript com Prisma conectado ao Supabase via connection pooler; modelo de Tenant com Supabase Auth integrado e middleware de isolamento multi-tenant (extensão `$extends` do Prisma Client, adaptado às mudanças do Prisma 7) com testes unitários; telas de Login/Cadastro e Onboarding de 3 passos fiéis ao design aprovado; biblioteca de componentes base e shell de navegação responsivo (sidebar desktop / bottom nav mobile) extraídos do design system; e o primeiro deploy público em produção na Vercel (`https://plantelboard.vercel.app`), conectado ao Supabase de produção.

Achados notáveis: a rede de desenvolvimento local exige o connection pooler do Supabase (sem suporte a IPv6 para a conexão direta); o Prisma 7 quebrou o padrão de middleware `$use` e exigiu adapter de driver explícito, resolvido com uma convenção de registro manual de modelos tenant-scoped; o campo "Registro/CNPJ" do mockup de Onboarding foi omitido por não constar no modelo de dados do Tenant (confirmado pelo usuário como correto); o badge do status "Fugiu" reaproveitou o estilo neutro de "Óbito" por não haver referência visual própria no design (decisão consistente com a regra de fidelidade ao design). No deploy (Task 1.5), um risco de exposição do `.env` local no artefato de build foi identificado e corrigido com `.vercelignore` antes da entrega. A confirmação de e-mail obrigatória do Supabase Auth bloqueou a validação ponta a ponta do cadastro tanto em desenvolvimento quanto em produção — o usuário decidiu desabilitá-la manualmente no painel do Supabase para o MVP. Cadastros de teste repetidos com endereços fabricados geraram um aviso do Supabase por alta taxa de bounce, resultando em uma nova regra de projeto para uso de e-mails reais em testes futuros.

**Task Logs:**
- task-01-01.log.md
- task-01-02.log.md
- task-01-03.log.md
- task-01-04.log.md
- task-01-05.log.md

