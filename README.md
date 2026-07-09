# Ninhal — Gestão de plantel para criadores de aves

SaaS multi-tenant (Next.js/TypeScript) para criadores de pássaros gerenciarem
plantel, ninhadas, genealogia (árvore/pedigree) e importação de dados do
IBAMA. Interface e textos 100% em português do Brasil. Produção em
**https://plantelboard.vercel.app**.

## Stack

- **Next.js (App Router) + TypeScript**, deploy na **Vercel** (serverless).
- **Prisma 7.8.0** sobre **Supabase Postgres**, via `@prisma/adapter-pg`
  (`lib/prisma.ts`) — usa o **pooler em modo transação** (porta `6543`,
  `pgbouncer=true`); ver [Nota importante sobre o pooler](#nota-importante-sobre-o-pooler-do-supabase) abaixo.
- **Supabase Auth** e **Supabase Storage**.
- **`@react-pdf/renderer`** para gerar Crachá e Certificado em PDF.
- **`pdf-parse` / `pdfjs-dist`** para extrair texto da Relação de
  Passeriformes do IBAMA na importação.
- **Vitest** (unitários) e **Playwright** (`e2e/`, ponta a ponta).

## Rodando localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000 (ou a porta que o preview tool escolher).

⚠️ **Node**: o Next.js exige Node ≥ 20.9. Se `node -v` no seu shell mostrar
v18, use uma versão mais nova via nvm (ex:
`/Users/gersonvan/.nvm/versions/node/v24.15.0/bin/node`) — já está
configurado assim em `.claude/launch.json` para o preview tool.

Variáveis de ambiente necessárias (ver `.env`, nunca commitado):
`DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
**Nunca invente ou deixe como placeholder um valor de credencial** — peça ao
usuário.

## Regras de projeto (ver `CLAUDE.md` para o texto completo)

- **Isolamento multi-tenant obrigatório**: toda leitura/escrita de dados de
  domínio (aves, ninhadas) passa pelo cliente `prisma` exportado em
  `lib/prisma.ts`, que aplica automaticamente o filtro de tenant via
  `tenantScopingExtension` (`lib/tenant/prisma-extension.ts`) dentro do
  contexto aberto por `runWithTenant` (`lib/tenant/context.ts`). Nunca faça
  uma query direta que ignore esse filtro.
- **Fidelidade ao design**: a pasta `design/` tem os mockups HTML aprovados
  (um por tela) e o design system (paleta, tipografia, componentes). Qualquer
  UI nova deve reaproveitar esses tokens/componentes, não inventar padrão
  visual novo. (Nota: `design/11 Exportar Pedigree.dc.html` é um mockup de uma
  tela que foi **removida do app** — ver histórico abaixo — mantido só como
  registro histórico do design, não reflete mais o fluxo atual.)
- **Testes automatizados são parte de "concluído"**: lógica de negócio
  precisa de teste unitário; fluxos completos, de teste e2e quando aplicável.
- **Idioma**: toda a UI e textos voltados ao usuário são em pt-BR.
- **E-mails de teste**: nunca use domínios fictícios (`teste@example.com`) em
  cadastros reais contra o Supabase — o projeto já levou um aviso de bounce
  rate alto. Use seu e-mail real com alias `+` (ex:
  `gersonvan+ninhal-<contexto>@gmail.com`).
- **Controle de versão**: repo `/Users/gersonvan/dev/plantel_board`, branch
  base `main`, remoto `origin` = `https://github.com/gersonvan/ninhal.git`.
  Branches `tipo/descricao-curta`, commits `tipo: descrição` (`feat`, `fix`,
  `refactor`, `docs`, `test`, `chore`). Push apenas quando pedido
  explicitamente.

## Estrutura de alto nível

- `app/` — rotas do App Router. Destaques:
  - `app/plantel/` — Cadastro Geral (lista + ficha da ave + `/novo`).
  - `app/plantel/[id]/pedigree/cracha/route.ts` e
    `app/plantel/[id]/pedigree/download/route.ts` — geram o Crachá e o
    Certificado (PDF) diretamente a partir da Ficha da Ave.
  - `app/ninhadas/`, `app/arvore/` — ninhadas e árvore genealógica.
  - `app/configuracoes/importar-ibama/` — importação da Relação de
    Passeriformes do IBAMA.
- `lib/tenant/` — mecanismo de isolamento multi-tenant (usar sempre).
- `lib/pedigree/` — montagem de dados (`service.ts`) e templates PDF
  (`PedigreeDocument.tsx` = Certificado, `CrachaDocument.tsx` = Crachá).
- `lib/importacao-ibama/` — parser do PDF do IBAMA (`parser.ts`), polyfills
  de PDF para produção (`pdf-polyfills.ts`), fixture sintética de teste
  (`fixtures/gerar-pdf-sintetico.tsx` — **nunca** usar `docs/relação de
  aves.pdf`, que tem dados pessoais reais, como fixture de teste).
- `design/` — mockups HTML aprovados + design system (fonte de verdade
  visual).
- `docs/` — guias de uso e checklist de aceite (não confundir com fixtures de
  teste).

## Nota importante sobre o pooler do Supabase

**Sempre use o pooler em modo transação (porta `6543`, com
`?pgbouncer=true`), nunca o modo sessão (porta `5432`).** O modo sessão limita
o projeto inteiro a ~15 conexões simultâneas — com várias instâncias
serverless da Vercel abrindo conexão ao mesmo tempo (ex: logo após um
deploy, ou sob tráfego concorrente normal), esse limite estoura rápido e
derruba o app inteiro (`login`, `/dashboard`, `/plantel`, geração de
Crachá/Certificado) com `EMAXCONNSESSION`. Isso já aconteceu em produção
(ver histórico abaixo) e foi corrigido trocando a porta. Como reforço
adicional, `lib/prisma.ts` também limita a `max: 3` conexões por instância do
pool (`PrismaPg`).

Se um erro `EMAXCONNSESSION` ou "max clients reached in session mode"
aparecer de novo, confira **primeiro** se a env var `DATABASE_URL` na Vercel
(Production) ainda está com a porta `6543` — pode ter sido revertida
manualmente ou recriada apontando para o modo sessão por engano.

## Histórico de trabalho (para continuar de onde parou)

### Fase 1 — MVP (concluída e em produção)
Cadastro Geral de aves, ninhadas, árvore genealógica, autenticação/onboarding
multi-tenant. 5 estágios, 24 tarefas, todas concluídas.

### Fase 2 — pós-MVP (concluída e em produção)
Catálogo de espécies self-service, importação de PDF do IBAMA, exportação de
Pedigree (Certificado) e Crachá. 3 estágios, 11+ tarefas corretivas.

O framework `.apm/` usado para gerenciar essas duas fases foi arquivado em
`.apm/archives/session-2026-07-07-001/` por uma sessão paralela; o trabalho
seguinte passou a ser conduzido com git puro (sem o framework APM).

### Sessão mais recente (2026-07-08) — três frentes

**1. Bug real de importação do IBAMA (usuário real "Davi")**
`app/configuracoes/importar-ibama` retornava 500 em produção e importava só
~10 de 23-24 aves de uma Relação de Passeriformes real. Causas encontradas e
corrigidas, todas em `lib/importacao-ibama/`:
- `parser.ts` foi **reescrito**: `pdf-parse`'s `getTable()` (detecção
  geométrica de tabela) fragmentava o documento real do IBAMA em dezenas de
  "tabelas" minúsculas por causa do sombreado alternado das linhas, perdendo
  a maioria das linhas silenciosamente. A extração agora usa `getText()`
  (texto puro) + um regex `LINHA_REGEX` ancorado no número sequencial de
  cada ave, com um lookbehind `(?<![,.\d])` para não confundir números de
  diâmetro/versão de anilha (ex: "2,6" ou "SISPASS 2.6...") com o início da
  próxima linha, e um `RODAPE_REGEX` para não vazar o rodapé/página seguinte
  para dentro da última ave da página.
- Dois bugs **só em produção** (nunca reproduziam local): `ReferenceError:
  DOMMatrix is not defined` (corrigido com polyfill puro-JS em
  `pdf-polyfills.ts`, evitando o binário nativo `@napi-rs/canvas`) e
  `Cannot find module '.../pdf.worker.mjs'` (corrigido com
  `outputFileTracingIncludes` em `next.config.ts`). Um terceiro bug de
  produção, `ReferenceError: LinhaConfirmacaoIbama is not defined`, veio de
  um `export type {...}` dentro de um arquivo `"use server"` — o Turbopack
  não lida bem com re-export de tipo em Server Actions; corrigido importando
  os tipos direto de `./types` no componente cliente.
- Verificado linha por linha contra o PDF real do usuário — 24/24 aves
  extraídas sem erro. Suíte de testes (`parser.test.ts`) ganhou 3 casos de
  regressão para esses achados.

**2. Reestruturação da Ficha da Ave (pedido explícito do usuário)**
Trocado o rodapé de 2 botões ("Voltar ao plantel" / "Origem") por 3 botões
diretos: **Voltar ao Plantel / Gerar Crachá / Gerar Certificado**
(`app/plantel/[id]/FichaAve.tsx`). O título do PDF do certificado foi
simplificado de "Certificado de Pedigree" para "Certificado"
(`lib/pedigree/PedigreeDocument.tsx`). A tela intermediária de preview
("Origem", de `/plantel/[id]/pedigree`) foi **removida por completo**
(`ExportarPedigreeView.tsx` e `page.tsx` deletados) — decisão explícita do
usuário ao ser perguntado se queria manter ou remover; as funções
compartilhadas (`montarDadosPedigree` etc.) continuam intactas pois as
rotas `/cracha` e `/download` as usam diretamente.

**3. Incidente de produção: esgotamento do pool de conexões do Postgres**
Depois do deploy acima, usuários relataram erro ao gerar Crachá/Certificado
— e depois até no login. Diagnóstico via `vercel logs`: erro
`DriverAdapterError (EMAXCONNSESSION) — max clients are limited to
pool_size: 15`, afetando **todas** as rotas (não só pedigree), confirmando
que era um problema de infraestrutura, não do código novo. Duas causas
contribuintes identificadas e corrigidas:
- `app/plantel/PlantelList.tsx` renderizava um `<Link>` do Next.js para
  cada ave da lista **sem `prefetch={false}`** — o prefetch automático do
  App Router disparava uma busca real (com query no banco) para cada ave
  visível na tela ao carregar a lista, multiplicando conexões
  desnecessariamente. Corrigido adicionando `prefetch={false}`.
- Causa raiz de fato: `DATABASE_URL` apontava para o pooler do Supabase em
  **modo sessão** (porta `5432`, teto de 15 conexões para o projeto
  inteiro) — inadequado para serverless, onde múltiplas instâncias abrem
  conexão concorrentemente. Corrigido migrando para o **modo transação**
  (porta `6543`, `?pgbouncer=true`) — mudança feita pelo usuário direto no
  dashboard da Vercel, pois a env var estava marcada como "sensitive"
  (write-only, não pode ser lida de volta via CLI). Reforço adicional
  aplicado em código: `lib/prisma.ts` agora passa `max: 3` para o
  `PrismaPg`, limitando conexões por instância serverless.
- Estado final confirmado saudável: `/login`, `/dashboard`,
  Crachá e Certificado voltaram a responder 200 sem erros nos logs da
  Vercel.

### Possíveis próximos passos
- Nenhuma tarefa pendente conhecida no momento — a última rodada de fixes
  foi commitada, enviada ao GitHub e implantada em produção.
- Se investigar novos erros de banco em produção, comece por
  `vercel logs https://plantelboard.vercel.app` e confira a nota sobre o
  pooler acima antes de qualquer outra hipótese.
