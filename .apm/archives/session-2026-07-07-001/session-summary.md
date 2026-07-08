---
date: 2026-07-07T19:15:00Z
project: Ninhal
stages_completed: 8
total_tasks: 33
outcome: complete
---

# Session Summary — Ninhal

## Project Scope

Ninhal é um SaaS web multi-tenant para criadores de aves ornamentais no Brasil, substituindo controle manual/planilhas por uma ferramenta que garante integridade genética do plantel. O MVP (Fase 1) cobriu: cadastro de aves, controle de ninhadas com cálculo automático de taxa de eclosão, duas travas de segurança na reprodução (compatibilidade de reprodutores e alerta de consanguinidade via coeficiente de parentesco), árvore genealógica navegável de 3 gerações, e exportação de pedigree em PDF. A Fase 2, documentada aqui, é um ciclo incremental originado de feedback de usuários reais já testando o MVP em produção (`docs/solicitacao-fase2.md`): (A) cadastro de novas espécies pelo usuário no catálogo compartilhado; (B) importação do plantel a partir do PDF oficial "Relação de Passeriformes" do IBAMA; e (C) um novo formato de exportação compacto ("Crachá") ao lado do Certificado de Pedigree já existente. Sucesso definido como: as três funcionalidades publicadas em produção, cobertas por testes automatizados, e aprovadas pelo mesmo revisor externo da Fase 1.

## Stages e Resultados

**Fase 1 (concluída em 2026-07-06, ver sessão anterior para detalhe completo Stage a Stage):** 5 Stages, 22 Tasks. Entregou o MVP completo — autenticação/onboarding, cadastro de aves e ninhadas com as duas travas de segurança, árvore genealógica, pedigree em PDF, configurações, suíte E2E, e primeiro deploy em produção (`https://plantelboard.vercel.app`).

**Fase 2 — Stage 1 (Cadastro de Espécies pelo Usuário):** 2 Tasks. Entregou `criarOuReaproveitarEspecie` (`lib/especies/service.ts`) com normalização de capitalização e checagem de duplicata (`lib/especies/normalizar.ts`), endpoint `POST /api/especies`, e duas superfícies de UI reaproveitando o mesmo endpoint — inline no Novo Cadastro de Ave e uma seção de gestão em Configurações. De passagem, corrigiu um bug real em `vitest.config.ts` que tentava executar a suíte Playwright como parte da suíte Vitest.

**Fase 2 — Stage 2 (Importação do Plantel via IBAMA):** 7 Tasks (Task 2.7 adicionada durante a execução). Schema estendido com `nomeCientifico`/`tipoAnilha`/`diametroAnilha`/`registro` (`Ave`) e `telefone` (`Tenant`); serviço de extração do PDF oficial por posição de coluna (`lib/importacao-ibama/parser.ts`, `pdf-parse`); criação automática de espécies ausentes durante a importação; tela de revisão/edição obrigatória antes de gravar (detecção de anilha duplicada com confirmação, vínculo opcional de pai/mãe restrito a aves já existentes, sugestão de dados do responsável com confirmação); três pontos de entrada (Onboarding opcional, Plantel, e uma seção adicional em Configurações não prevista originalmente no Spec, mantida por decisão do Worker). Foi a Stage de maior risco técnico do ciclo — duas verificações manuais do Manager encontraram e corrigiram dois bugs reais na extração: hífen espúrio inserido em quebras de linha (Task 2.5) e truncamento silencioso de texto sem espaço pelo `@react-pdf/renderer` na geração da fixture de teste (Task 2.6, mitigado com heurística `pareceTruncada`/`LIMITE_SUSPEITO_ANILHA`). Nenhum dos dois foi pego pelos testes automatizados originais da Task 2.2.

**Fase 2 — Stage 3 (Crachá — Formato de Exportação Compacto):** 2 Tasks. Tela de exportação renomeada de "Pedigree" para "Origem" com ação única "Exportar" oferecendo Certificado (inalterado, regressão confirmada) e Crachá (novo, PDF 10x6cm reaproveitando a árvore de 3 gerações e a infraestrutura de PDF existente). Renderização verificada manualmente pelo Manager (ferramenta de preview não renderiza PDF embutido).

## Principais Entregas

- Aplicação em produção: `https://plantelboard.vercel.app`
- Cadastro de espécies: `lib/especies/service.ts`, `lib/especies/normalizar.ts`, `app/api/especies/route.ts`
- Importação IBAMA: `lib/importacao-ibama/parser.ts`, `app/configuracoes/importar-ibama/ImportarIbamaView.tsx`, pontos de entrada em Onboarding/Plantel/Configurações
- Crachá: `app/plantel/[id]/pedigree/cracha/route.ts`, `lib/pedigree/CrachaDocument.tsx`, tela "Origem" (`app/plantel/[id]/pedigree/ExportarPedigreeView.tsx`)
- Schema estendido: `nomeCientifico`, `tipoAnilha`, `diametroAnilha`, `registro` (`Ave`); `telefone` (`Tenant`)
- Suíte de testes: 139 testes (vs. 100 ao final da Fase 1)

## Estado do Código-fonte

Um agente Explore independente cross-validou os artefatos `.apm/` da Fase 2 (Plano, Tracker, Memory Index, Task Logs) contra o código atual e o histórico git. Resultado:

- Todas as três Stages da Fase 2 foram confirmadas como genuinamente completas — cada arquivo, função e comportamento reivindicado nos Task Logs existe no código como descrito (`lib/especies/service.ts:18`, `prisma/schema.prisma:25,74-80`, `lib/importacao-ibama/parser.ts:1,37,104,123-129`, `lib/pedigree/service.ts:7,61`, `lib/pedigree/CrachaDocument.tsx`).
- Suíte Vitest: 139 testes, 138 passando, 1 falha — `lib/parentesco/service.test.ts` com `EMAXCONNSESSION` (contenção de pool de conexão compartilhado dev/teste/produção), problema de infraestrutura já documentado na Memory, não bug de lógica.
- Nenhum arquivo modificado ou staged sem commit (apenas este próprio `session-summary.md` como untracked) — nada contradiz o `completed_at` do Tracker.
- **Discrepância procedural encontrada:** Plano/Tracker/Memory Index afirmam que o trabalho foi feito na branch `feat/fase2-especies-e-schema`, mergeada para `main`. Na prática, essa branch não existe (local nem no remoto) e o histórico git é inteiramente linear em `main` — sem nenhum commit de merge, do início ao fim da Fase 2 (`2475d51` a `fa36e71`, HEAD atual). O mesmo padrão se repete nas branches de Stage da Fase 1. Ou os commits foram feitos diretamente em `main` sem criar a branch, ou a branch foi fast-forwarded e sua ref removida sem deixar rastro. É um desvio da convenção de controle de versão registrada em `CLAUDE.md`, não um problema funcional.
- Não foi possível verificar a URL de produção ao vivo a partir do ambiente de verificação (sem acesso de rede externo); não há `vercel.json` no repositório (configuração via dashboard da Vercel, não IaC).

## Achados Notáveis

- A causa raiz do truncamento de anilha (Task 2.6) está na geração do PDF de teste (`@react-pdf/renderer`), não na extração (`pdf-parse`) — os caracteres perdidos nunca existem no arquivo, então nenhuma correção do lado da extração pode recuperá-los; mitigado apenas com heurística de detecção e reporte para revisão manual.
- `pdf-parse` (`getText()`/`getTable()`) trava com `DataCloneError` se chamados em paralelo na mesma instância — devem ser sequenciais.
- Dois bugs reais e sérios de extração de PDF (hífen espúrio e truncamento) só foram encontrados por verificação manual ponta a ponta do Manager, não pelos testes automatizados originais das Tasks correspondentes — reforça o valor da verificação holística já praticado desde a Fase 1.
- Um ponto de entrada de UI (seção de importação em Configurações, Task 2.4) foi adicionado pelo Worker sem especificação explícita no Task Prompt daquela Task — mantido como entrada adicional válida em vez de removido, por já estar alinhado com a decisão do Spec.
- Discrepância entre a convenção de controle de versão documentada (branches de feature por Task/Stage) e a prática real (commits lineares direto em `main`, sem branches nem merges) — recorrente desde a Fase 1, vale reforçar o hábito de criar e mergear branches de fato se a rastreabilidade por branch for importante no futuro.

## Problemas Conhecidos

- Ambiente de testes ainda compartilha o pool de conexão do Supabase com produção — causa da falha intermitente `EMAXCONNSESSION` observada nesta verificação (1 de 139 testes), consistente com o problema já registrado desde a Fase 1 e adiado pelo usuário para pós-MVP.
- Convenção de branch de feature por Stage/Task documentada em `CLAUDE.md`/Tracker não reflete a prática real (histórico linear em `main`, sem branches nem merges rastreáveis).
- Limiar de detecção de truncamento de anilha (`LIMITE_SUSPEITO_ANILHA = 20`) é calibrado para a fixture sintética de teste — ainda não validado contra o leiaute real do documento do IBAMA (nunca usar `docs/relação de aves.pdf`, que contém dados pessoais reais, como fixture).
- Suíte E2E completa (Fase 1) nunca rodou 100% limpa em uma única rodada devido à mesma contenção de pool — usuário orientou repetir a suíte a cada nova funcionalidade, mas não há registro de que isso foi feito para a Fase 2 nesta sessão.

## Snapshot Notice

Este resumo reflete o estado da sessão em 2026-07-07T19:15:00Z. O código-fonte pode ter divergido desde a criação deste resumo.
