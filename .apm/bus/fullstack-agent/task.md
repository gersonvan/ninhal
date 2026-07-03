---
batch: true
batch_size: 3
tasks:
  - stage: 1
    task: 1
    log_path: ".apm/memory/stage-01/task-01-01.log.md"
  - stage: 1
    task: 2
    log_path: ".apm/memory/stage-01/task-01-02.log.md"
  - stage: 1
    task: 3
    log_path: ".apm/memory/stage-01/task-01-03.log.md"
---

# Task 1.1 - Inicialização do projeto e infraestrutura base

---
stage: 1
task: 1
agent: fullstack-agent
log_path: ".apm/memory/stage-01/task-01-01.log.md"
has_dependencies: false
---

## Task Reference

Task 1.1, assigned to fullstack-agent.

## Objective

Criar o esqueleto do projeto Next.js (TypeScript) dentro do repositório já inicializado, e conectar o Prisma a um banco Postgres gerenciado pelo Supabase.

## Detailed Instructions

O repositório git já foi inicializado na raiz do projeto (branch base `main`) e você está posicionado na branch de feature `feat/setup-multitenancy-onboarding` — não inicialize um novo repositório nem crie uma branch adicional.

1. Criar o scaffold do projeto Next.js com TypeScript na raiz do repositório (`/Users/gersonvan/dev/plantel_board`), usando App Router.
2. Instalar o Prisma como ORM. A aplicação é fullstack: frontend e backend no mesmo projeto Next.js.
3. Parar e solicitar explicitamente ao usuário, nesta conversa: a criação/acesso a um projeto Supabase e a string de conexão Postgres (formato `postgresql://...`) a ser usada pelo Prisma. Não invente, assuma ou deixe como placeholder nenhuma credencial ou identificador de conta — isto é uma regra de projeto sem exceções. O usuário já confirmou ter acesso à conta Supabase e autorizou a instalação de CLIs necessárias neste ambiente.
4. Configurar o Prisma com a connection string fornecida (variável de ambiente, ex: `DATABASE_URL`).
5. Verificar a conectividade executando uma migração inicial vazia (`prisma migrate dev` ou equivalente) contra o banco Supabase fornecido.
6. Commitar o estado inicial do projeto na branch `feat/setup-multitenancy-onboarding`, seguindo a convenção de commit `tipo: descrição` (tipos: feat, fix, refactor, docs, test, chore) — este primeiro commit deve usar o tipo `chore`.

## Workspace

Diretório de trabalho: `/Users/gersonvan/dev/plantel_board` (raiz do projeto). Branch: `feat/setup-multitenancy-onboarding` (já criada e já ativa — apenas commitar nela, sem criar novas branches).

## Expected Output

Scaffold do projeto Next.js (TypeScript) na raiz; Prisma instalado e configurado com uma conexão válida ao banco Supabase; estrutura de pastas base do projeto; commit inicial na branch de feature.

## Validation Criteria

`npm run dev` inicia sem erros localmente; a migração inicial do Prisma conecta e executa com sucesso contra o banco Supabase; existe um commit no git registrando o estado inicial.

## Instruction Accuracy

O objetivo e o output esperado são autoritativos. As instruções detalhadas acima refletem o estado conhecido do projeto no momento do planejamento — se algo no código já existente contradisser uma instrução específica (por exemplo, se alguma configuração já existir), valide o estado real antes de prosseguir com a instrução como escrita.

## Task Iteration

Ao encontrar falha de validação, investigue antes de corrigir — leia a saída de erro, rastreie a causa, entenda o que deu errado, e aplique uma mudança direcionada por iteração. Se uma correção não resolver o problema, use um subagente de debug com instruções estruturadas (saída de erro, o que foi investigado e tentado, caminhos de arquivo relevantes, comportamento esperado vs. real) para rastrear a causa raiz e propor uma correção — valide os achados do subagente antes de aplicá-los. Se o problema persistir após a investigação do subagente, reporte com status Partial.

---

# Task 1.2 - Modelo multi-tenant e autenticação

---
stage: 1
task: 2
agent: fullstack-agent
log_path: ".apm/memory/stage-01/task-01-02.log.md"
has_dependencies: true
---

## Task Reference

Task 1.2, assigned to fullstack-agent.

## Context from Dependencies

Building on your previous work:

**From Task 1.1:** Você criou o scaffold do projeto Next.js/TypeScript e configurou o Prisma apontando para o banco Postgres do Supabase, com o primeiro commit já feito na branch `feat/setup-multitenancy-onboarding`.

**Integration Approach:** Continue no mesmo schema Prisma criado na Task 1.1 e na mesma branch. Esta Task adiciona o modelo de Tenant e a autenticação por cima dessa base.

## Objective

Implementar o modelo de dados de Tenant, integrar o Supabase Auth (cadastro, login, logout), e construir o middleware do Prisma que isola dados por tenant — este middleware é o mecanismo de isolamento multi-tenant que **toda** tabela de domínio futura (aves, ninhadas, e qualquer entidade vinculada a uma conta) deve usar. Um vazamento de dados entre contas é uma falha crítica de segurança, não um bug menor: nenhuma consulta a dados de domínio pode contornar este filtro.

## Detailed Instructions

1. Modelar o Tenant no schema Prisma. Cada conta de usuário corresponde a um criador/tenant. Este modelo será referenciado por todas as tabelas de domínio futuras (Cadastro Geral de aves, Ninhadas).
2. Integrar o SDK do Supabase Auth ao Next.js, cobrindo cadastro, login, logout e gestão de sessão, usando autenticação por e-mail/senha.
3. Implementar um middleware do Prisma que injeta e valida automaticamente o filtro de tenant em toda consulta a tabelas tenant-scoped — a estratégia escolhida é isolamento na camada de aplicação (não Row-Level Security nativa do Postgres), porque o Prisma opera sobre uma conexão/pool compartilhada, não a conexão autenticada por usuário do Supabase, e fazer RLS nativa funcionar exigiria propagar o contexto do usuário autenticado até a sessão do Postgres a cada consulta — mais complexo do que necessário para este momento do projeto.
4. Escrever testes automatizados (Vitest) cobrindo: acesso correto a dados da mesma tenant, e acesso bloqueado/filtrado a dados de uma tenant diferente.

## Workspace

Diretório de trabalho: `/Users/gersonvan/dev/plantel_board` (raiz do projeto). Branch: `feat/setup-multitenancy-onboarding` (mesma branch da Task 1.1 — continue commitando nela).

## Expected Output

Schema Prisma com o modelo de Tenant e a relação que todas as tabelas de domínio usarão; integração funcional com Supabase Auth; middleware do Prisma aplicando o filtro de tenant automaticamente; testes automatizados do middleware.

## Validation Criteria

Testes automatizados demonstram que uma consulta sem o contexto de tenant correto é bloqueada ou filtrada corretamente; o fluxo manual de cadastro/login/logout funciona localmente.

## Instruction Accuracy

O objetivo e o output esperado são autoritativos. Valide o estado real do código (schema Prisma e configuração criados na Task 1.1) antes de seguir as instruções detalhadas literalmente, caso algo tenha mudado.

## Task Iteration

Mesmo protocolo de iteração da Task 1.1: investigar antes de corrigir, uma mudança direcionada por iteração, subagente de debug estruturado se uma correção não resolver, status Partial se persistir.

---

# Task 1.3 - Telas de Login e Onboarding do criatório

---
stage: 1
task: 3
agent: fullstack-agent
log_path: ".apm/memory/stage-01/task-01-03.log.md"
has_dependencies: true
---

## Task Reference

Task 1.3, assigned to fullstack-agent.

## Context from Dependencies

Building on your previous work:

**From Task 1.2:** Você integrou o Supabase Auth (cadastro, login, logout) e implementou o modelo de Tenant com middleware de isolamento no Prisma.

**Integration Approach:** Esta Task constrói a UI que consome a autenticação da Task 1.2 e persiste os dados coletados no onboarding usando o modelo de Tenant já criado.

## Objective

Implementar as telas de Login/Cadastro e Onboarding, criando o perfil do criatório (tenant) durante o primeiro acesso do usuário.

## Detailed Instructions

1. Implementar a tela de Login/Cadastro consumindo o Supabase Auth já integrado na Task 1.2. Use `design/01 Login.dc.html` como referência direta de layout, componentes e conteúdo de exemplo — não introduza padrões visuais fora do que está ali. Paleta de cores e tipografia vêm de `design/Design System.dc.html`.
2. Implementar o fluxo de Onboarding coletando: nome do criatório, foco de criação, e logo (upload de imagem). Use `design/02 Onboarding.dc.html` como referência direta.
3. Ao concluir o onboarding, persistir os dados coletados no registro de Tenant (modelo criado na Task 1.2), associado ao usuário autenticado.
4. Redirecionar o usuário para um Dashboard vazio ao final do fluxo (uma tela placeholder é suficiente nesta Task — o shell de navegação completo e o conteúdo real do Dashboard são construídos em uma etapa posterior).

## Workspace

Diretório de trabalho: `/Users/gersonvan/dev/plantel_board` (raiz do projeto). Branch: `feat/setup-multitenancy-onboarding` (mesma branch das Tasks 1.1 e 1.2 — continue commitando nela).

## Expected Output

Tela de Login/Cadastro funcional; fluxo de Onboarding que coleta nome do criatório, foco de criação e logo, e cria o registro de Tenant associado ao usuário.

## Validation Criteria

Um novo usuário consegue se cadastrar, completar o onboarding, e chegar a um Dashboard vazio; a aparência das telas de Login e Onboarding confere com os arquivos de design referenciados.

## Instruction Accuracy

O objetivo e o output esperado são autoritativos. Se o estado real do código (autenticação e modelo de Tenant da Task 1.2) divergir das instruções acima, valide o estado real antes de prosseguir.

## Task Iteration

Mesmo protocolo de iteração das Tasks anteriores: investigar antes de corrigir, uma mudança direcionada por iteração, subagente de debug estruturado se necessário, status Partial se persistir.

## Task Logging

Escreva um Task Log individual para cada uma das três Tasks deste lote, imediatamente após completar cada uma (não adie o registro para o final do lote) — path de cada log conforme o frontmatter do lote acima. Siga a estrutura de Task Log padrão: frontmatter (stage, task, title, agent, status, important_findings, compatibility_issues) e corpo (Summary, Details, Output, Validation, Issues, e as seções condicionais Compatibility Concerns / Important Findings quando aplicável).

## Task Report

Ao concluir o lote (ou parar antecipadamente por falha), escreva um Batch Report na Report Bus (`.apm/bus/fullstack-agent/report.md`) cobrindo os desfechos das três Tasks. Direcione o usuário a rodar `/apm-5-check-reports` (ou `/apm-5-check-reports fullstack-agent`) na conversa do Manager para entregar o relatório.
