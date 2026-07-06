# Solicitação — Fase 2 do Ninhal (pós-MVP)

Este documento reúne o pedido de melhorias trazidas por usuários reais que já
estão testando o MVP do Ninhal (`https://plantelboard.vercel.app`), para servir de
insumo a uma nova sessão de planejamento (`/apm-1-initiate-planner`). O MVP original
está descrito em `.apm/spec.md` e `.apm/plan.md` (sessão anterior, completa) — este
pedido não os substitui, é uma extensão sobre o produto já em produção.

## Contexto de origem

Durante os testes iniciais com usuários reais, surgiram quatro observações:

1. Faltava a categoria "Silvestres" nas opções de foco de criação do onboarding —
   **já corrigido diretamente** (ajuste de conteúdo trivial, sem impacto de escopo),
   commit `2805861`.
2. Um usuário perguntou como cadastrar novas espécies além das 3 pré-carregadas
   (Canário Belga, Calopsita, Periquito Australiano) — **não há hoje** nenhuma
   interface para isso.
3. Foi sugerido usar a "Relação de Passeriformes" que o IBAMA emite para cada
   criador (documento oficial de controle de plantel via SISPASS/CTF) como forma de
   já iniciar o cadastro do plantel durante o onboarding, em vez do usuário digitar
   ave por ave.
4. O usuário perguntou sobre gerar um "crachá" (carteira compacta) da ave, além do
   certificado de pedigree completo já existente — inspirado em um exemplo de uma
   ferramenta concorrente.

Os itens 2, 3 e 4 são o escopo desta solicitação (Pedidos A, B e C abaixo).

## Pedido A — Cadastro de espécies pelo usuário

**Problema:** o catálogo de `Especie` (`prisma/schema.prisma`) foi desenhado desde o
início do MVP como uma lista gerenciável e extensível, mas nenhuma Task da Stage 2
construiu uma interface para o usuário final adicionar uma espécie nova. Hoje,
`GET /api/especies` é o único endpoint existente (somente leitura); a única forma de
adicionar uma espécie é acesso direto ao banco de dados.

**Decisões em aberto para a sessão de planejamento:**
- `Especie` é hoje um catálogo **compartilhado entre todos os tenants** (decisão da
  Stage 2 original, ver nota em `.apm/memory/index.md`). Adicionar uma espécie nova
  agora ficaria visível para todos os criadores do sistema — é isso que se quer, ou
  cada criatório deveria poder ter espécies próprias (exigiria tornar `Especie`
  tenant-scoped, uma mudança de schema)?
- Onde essa tela/ação deve viver — dentro do fluxo de cadastro de ave (ex: "não
  encontrou sua espécie? adicione aqui"), na tela de Configurações, ou as duas?
- Validação/moderação: qualquer usuário pode adicionar qualquer nome, ou deve haver
  alguma checagem (ex: nome científico como referência, evitar duplicatas por grafia
  diferente)?

## Pedido B — Importação do plantel a partir da Relação de Passeriformes do IBAMA

**Problema:** criadores de aves silvestres nativas já têm seus dados de plantel
formalizados pelo IBAMA (SISPASS/CTF) e gostariam de importar essa relação durante o
onboarding, em vez de cadastrar ave por ave manualmente.

**Formato de origem:** documento PDF oficial ("Relação de Passeriformes",
Ministério do Meio Ambiente/IBAMA), com uma tabela por criador contendo as colunas:

| Coluna do IBAMA | Campo correspondente em `Ave` | Observação |
|---|---|---|
| Nome científico | *(não existe hoje)* | Precisaria de campo novo, ou descartar na importação |
| Nome comum | `especie.nome` | Pode não existir ainda no catálogo — depende do Pedido A |
| Sexo (M/F/I) | `sexo` (Macho/Fêmea/Não sexado) | "I" provavelmente mapeia para Não sexado — confirmar |
| Nascimento | `dataNascimento` | Formato direto |
| Código de anilha | `anilha` | Único por tenant — checar duplicatas na importação |
| Tipo anilha / Diâmetro | *(não existe hoje)* | Precisaria de campo novo, ou descartar na importação |
| — | `origem` (Nascida no criatório/Adquirida) | **Não vem no documento do IBAMA** — precisa de uma regra padrão ou pergunta ao usuário |
| — | `anilhaPaiId`/`anilhaMaeId` | **Não vem no documento** — genealogia não é rastreada pelo IBAMA, ficaria "Não registrado" para todas as aves importadas |

Um exemplo real (anonimizado) do documento está em `docs/relação de aves.pdf` —
**contém dados pessoais do criador de exemplo (nome, CPF, endereço, telefone,
e-mail) e não deve ser usado como dado de produção nem compartilhado além do
necessário para entender o formato.**

**Decisões em aberto para a sessão de planejamento:**
- Extração de dados de um PDF é frágil (varia por leiaute/versão do IBAMA). Vale
  perguntar ao usuário se aceitaríamos apenas uma versão em planilha/CSV (mais
  simples e confiável) ou se a extração direta do PDF é um requisito real.
- Depende do Pedido A: espécies presentes no documento (ex: Curió, Bicudo-verdadeiro,
  Galo-da-campina) e ausentes do catálogo atual precisam ser criadas — automaticamente
  durante a importação, ou o usuário revisa antes de confirmar?
- Regra para `origem` das aves importadas (ver tabela acima).
- Onde esse fluxo se encaixa: como um passo opcional adicional no onboarding (a Spec
  original já previa o onboarding terminando em "Dashboard vazio" — este pedido
  mudaria esse comportamento para usuários que optarem por importar), ou como uma
  ação separada acessível a qualquer momento (ex: em Configurações ou no Plantel)?
- Tratamento de duplicatas: o que fazer se uma anilha do documento já existir no
  plantel do tenant (reimportação, ou erro do usuário)?

## Pedido C — "Crachá" (carteira compacta) como formato adicional de exportação

**Problema:** hoje o Ninhal só exporta o Certificado de Pedigree completo (PDF com a
árvore de 3 gerações, `lib/pedigree/PedigreeDocument.tsx`, Task 4.3/4.4). O usuário
trouxe, como referência de uma ferramenta concorrente (MyBirds), um segundo formato
menor — uma "carteira"/crachá compacto: cartão de identificação da ave (foto, nome,
anilha, espécie, nascimento, sexo, dados do proprietário) com uma árvore genealógica
resumida ao lado, num layout mais compacto que o certificado atual.

Os dois arquivos de referência (não fazem parte do design aprovado do Ninhal) estão
em `design/referencias-externas/`:
- `carteira-mybirds-exemplo.pdf` — o formato de carteira compacta em si.
- `certificado-mybirds-exemplo.jpeg` — um certificado maior da mesma ferramenta, com
  árvore de 5 gerações (fora do escopo deste pedido C, mas relevante se a
  conversa também tocar em aumentar a profundidade da árvore do Ninhal).

**Tamanho definido pelo usuário:** 10x6 cm (formato carteira/cartão físico, para
impressão — bem menor que uma página do certificado atual).

**Decisões em aberto para a sessão de planejamento:**
- É um formato adicional (usuário escolhe "Certificado" ou "Crachá" na tela de
  Exportar Pedigree, `app/plantel/[id]/pedigree/`), ou substitui o certificado atual?
- Que dados do crachá de referência fazem sentido manter — o layout do Ninhal usa a
  identidade visual do Design System aprovado, não o do exemplo trazido (regra de
  fidelidade ao design already estabelecida no projeto); o exemplo serve só de
  inspiração de conteúdo/estrutura, não de estilo visual.
- A árvore genealógica resumida do crachá pode reaproveitar o mesmo serviço de 3
  gerações já existente (`lib/arvore/service.ts`, Task 4.1) — não deveria exigir
  lógica de dados nova, só um layout mais compacto.

## Recomendação

Como os três pedidos têm decisões de schema e/ou fluxo de produto (não são ajustes de
conteúdo), o caminho apropriado é uma nova sessão de planejamento
(`/apm-1-initiate-planner`, em uma conversa nova) para conduzir o Context Gathering
com o usuário sobre os pontos em aberto acima, e produzir um Spec/Plan incremental
sobre o produto já em produção.
