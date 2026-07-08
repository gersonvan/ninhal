---
title: Ninhal
modified: Spec rewritten by the Planner for Fase 2 (incremental cycle on top of the completed and deployed MVP).
---

# APM Spec

## Overview

Esta é a Fase 2 do Ninhal (pós-MVP): três melhorias solicitadas por usuários reais que já testam o produto em produção (`https://plantelboard.vercel.app`). O escopo é: (A) permitir que o usuário cadastre novas espécies no catálogo compartilhado, hoje limitado a 3 entradas pré-carregadas; (B) importar o plantel a partir do documento oficial "Relação de Passeriformes" do IBAMA, em vez de cadastro ave por ave; e (C) um formato de exportação compacto adicional ("Crachá"), ao lado do Certificado de Pedigree completo já existente. O sucesso desta fase é definido como: as três funcionalidades publicadas no mesmo ambiente de produção, cobertas por testes automatizados, e aprovadas pelo mesmo revisor externo da Fase 1 — que precisa delas em produção para testar, no mesmo padrão de antes.

## Workspace

Mesmo workspace da Fase 1 (`/Users/gersonvan/dev/plantel_board`), já um repositório git real com histórico de commits desde então — nenhuma inicialização é necessária. O histórico completo da Fase 1 (decisões, achados técnicos, arquivos entregues) está preservado em `.apm/memory/index.md` e `.apm/session-summary.md`; este Spec não o repete, apenas referencia quando relevante. `prisma/schema.prisma` é a fonte de verdade atual do modelo de dados (verificado diretamente, não por memória). `docs/solicitacao-fase2.md` é o documento de origem desta solicitação — referenciado, não duplicado. `design/` continua sendo a única fonte oficial de estilo visual; `design/referencias-externas/` contém material de uma ferramenta concorrente trazido pelo usuário como inspiração de **conteúdo/estrutura** para o Pedido C, não de estilo.

---

> **Notes:** O arquivo `docs/relação de aves.pdf` (referenciado pelo Pedido B) contém dados pessoais reais de um criador de exemplo (nome, CPF, endereço, telefone, e-mail) e não deve ser usado como fixture de teste nem commitado em massa de dados de teste — qualquer teste automatizado do fluxo de importação deve usar um PDF sintético equivalente em estrutura (mesmas colunas e leiaute), não este arquivo. O mesmo revisor externo da Fase 1 fará a aceitação desta fase e precisa das três funcionalidades em produção para testar — mesmo padrão de coordenação de antes. As Rules em `CLAUDE.md` (isolamento multi-tenant, fidelidade ao design, testes automatizados, credenciais, reaproveitamento de lógica, idioma, e-mails reais de teste, controle de versão) continuam valendo integralmente para esta fase, sem necessidade de alteração.

## Pedido A — Cadastro de Espécies pelo Usuário

- O catálogo `Especie` continua **compartilhado globalmente** entre todos os tenants — decisão explícita de manter a arquitetura da Fase 1, não uma mudança.
- Duas superfícies de UI para adicionar uma espécie: (1) inline no fluxo de Novo Cadastro de Ave (ação "não encontrou sua espécie? adicione aqui"); (2) uma seção de gestão do catálogo na tela de Configurações.
- Normalização obrigatória antes de gravar: capitalizar a primeira letra de cada palavra (ex: "Canário Belga"); comparar de forma normalizada/case-insensitive contra o catálogo existente — se já existir uma entrada equivalente, reaproveitar em vez de criar duplicata.
- Toda consulta ao catálogo retorna a lista em **ordem alfabética**.
- Ideia registrada para o futuro, **fora do escopo desta fase**: bloquear novas inserções quando o catálogo for considerado "completo".

## Pedido B — Importação do Plantel via Relação de Passeriformes do IBAMA

- Formato de entrada: **PDF oficial do IBAMA** — não há alternativa em CSV/planilha ou API disponível. Estrutura confirmada por inspeção direta do documento de exemplo: tabela **baseada em texto** (não escaneada), colunas `#, Nome científico, Nome comum, Sexo, Nascimento, Tipo anilha, Diam., Código de anilha`, largura fixa consistente. Extração viável via parsing de texto por posição de coluna, sem necessidade de OCR — mas o leiaute pode variar entre versões/anos do documento do IBAMA, por isso a etapa de revisão manual (abaixo) é a defesa principal contra erro de extração, não apenas uma conveniência de UX.
- **Fluxo**: upload do PDF → extração da tabela → criação automática de espécies ausentes no catálogo (reaproveitando a lógica de normalização do Pedido A) → tela de revisão/edição de todas as linhas extraídas (cada campo editável) → confirmação explícita do usuário → gravação no plantel.
- Na revisão, cada linha pode **opcionalmente** vincular `anilhaPaiId`/`anilhaMaeId`, restrito a aves **já existentes no banco** (cadastradas manualmente ou de importações anteriores) — nunca outra linha do mesmo lote ainda não confirmado, que ainda não existe como registro.
- Mapeamento de sexo do documento: M → Macho, F → Fêmea, I → Não Sexado.
- `origem` de toda ave importada: sempre `ADQUIRIDA`.
- Anilha duplicada (já existe no tenant): a importação **permite atualizar** o registro existente, mas **alerta o usuário** antes de prosseguir com a atualização.
- **Extração adicional de identificação do responsável**: o mesmo documento contém, em seção separada da tabela de aves, a identificação do criador (nome, telefone, CPF, endereço). O nome e o telefone são extraídos e usados para **sugerir** o preenchimento do perfil do responsável no `Tenant` — sempre apresentados ao usuário para confirmação antes de salvar, nunca gravados automaticamente sem revisão. CPF e endereço não são capturados nesta fase. Qualquer outro conteúdo do documento fora da tabela de aves e desses dois campos de identificação não é lido nem armazenado.
- Acesso ao fluxo: passo **opcional** extra no Onboarding, e também disponível depois a partir da área do Plantel.
- Fora do escopo desta fase: limite de linhas por arquivo, notificação de conclusão, suporte a múltiplos arquivos simultâneos.

## Pedido C — Crachá (Formato de Exportação Compacto)

- Reestruturação da tela de exportação existente (Fase 1, Task 4.4): a seção antes chamada "Pedigree" passa a se chamar **"Origem"**, com uma ação única **"Exportar"** que oferece dois formatos: **Certificado** (já existente, sem mudança) e **Crachá** (novo).
- O Crachá é um formato **adicional** — não substitui o Certificado.
- Tamanho de impressão: **10x6cm**. Formato de saída: **PDF apenas** (sem opção de imagem, ao contrário do Certificado).
- Profundidade genealógica: mantém as **3 gerações já existentes** — reaproveita integralmente o serviço de árvore da Fase 1 (`lib/arvore/service.ts`), sem nova lógica de dados, apenas um layout mais compacto. A referência externa trazida pelo usuário mostra uma árvore mais profunda (4+ gerações), mas isso foi explicitamente descartado para esta fase.
- Conteúdo do cartão: foto, nome, anilha, espécie, nascimento, sexo, `registro` (novo campo, ver Mudanças de Schema) e dados do responsável (nome — já existe via `user_metadata.full_name` do Supabase Auth desde a Task 4.5; telefone — novo campo).
- Estilo visual segue o Design System aprovado do Ninhal (Fase 1) — a referência externa (`design/referencias-externas/`) serve apenas de inspiração de conteúdo/estrutura, nunca de estilo, per a regra de fidelidade ao design já estabelecida.

## Mudanças de Schema

| Campo novo | Modelo | Tipo / Regra |
|---|---|---|
| `nomeCientifico` | `Ave` | string, opcional |
| `tipoAnilha` | `Ave` | string, opcional |
| `diametroAnilha` | `Ave` | opcional (numérico/decimal, ex: "5,5") |
| `registro` | `Ave` | string, opcional — preenchido manualmente pelo usuário; **não** populado automaticamente pela importação do Pedido B (sem coluna de origem confiável no documento do IBAMA) |
| `telefone` | `Tenant` | string, opcional — editável em Configurações; pode ser sugerido (com confirmação) pela extração de identificação do Pedido B |

Nenhuma mudança é necessária em `Ninhada`. `Especie` permanece sem mudança de schema (continua catálogo compartilhado, sem campo de tenant).

## Arquitetura e Reaproveitamento

- Mesma stack da Fase 1 (Next.js/TypeScript, Prisma, Supabase, Vercel) — nenhuma nova infraestrutura necessária.
- O Pedido C reaproveita integralmente o serviço de árvore (`lib/arvore/service.ts`) e a geração de PDF (`lib/pedigree/`) já existentes — apenas um novo template/layout compacto é construído.
- O Pedido B reaproveita a validação de compatibilidade espécie/sexo já construída para a seleção de pai/mãe no cadastro manual (Fase 1, Task 2.1/2.3) para o vínculo opcional de parentesco na tela de revisão da importação.
- Todos os campos novos em tabelas tenant-scoped (`Ave`, `Tenant`) seguem o mesmo padrão de isolamento multi-tenant já estabelecido (`$extends` do Prisma) — nenhuma mudança na estratégia de isolamento é necessária.

## Escopo desta Fase

**Dentro:**
- Cadastro de espécies pelo usuário (Pedido A), com padronização e checagem de duplicata.
- Importação do plantel via PDF do IBAMA (Pedido B), com revisão manual obrigatória antes de confirmar, incluindo sugestão de dados do responsável.
- Crachá como formato de exportação adicional (Pedido C), reaproveitando a árvore de 3 gerações; reestruturação da tela de exportação ("Origem" / "Exportar").
- Campos novos: `nomeCientifico`, `tipoAnilha`, `diametroAnilha`, `registro` (`Ave`); `telefone` (`Tenant`).

**Fora (adiado para versões futuras):**
- Tornar `Especie` tenant-scoped (catálogo continua compartilhado).
- Bloqueio de novas espécies quando o catálogo for considerado "completo".
- Suporte a CSV/planilha ou API para importação — apenas PDF nesta fase.
- Captura de CPF ou endereço do responsável.
- Limite de linhas, notificação de conclusão, ou múltiplos arquivos na importação.
- Aumentar a profundidade da árvore genealógica além de 3 gerações.
