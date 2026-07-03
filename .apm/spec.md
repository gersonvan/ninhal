---
title: Ninhal
modified: Spec updated by the Planner after design material review.
---

# APM Spec

## Overview

Ninhal é um SaaS web multi-tenant voltado a criadores de aves ornamentais no Brasil, permitindo controle do plantel, registro de reproduções e visualização automática da genealogia das aves. O problema central é substituir controles manuais e planilhas por uma ferramenta acessível que garante integridade genética do plantel, prevenindo erros de cadastro e cruzamentos consanguíneos. O escopo essencial do MVP cobre cadastro de aves, controle de ninhadas com cálculo automático de taxa de eclosão, uma árvore genealógica navegável e exportação de pedigree em PDF como diferencial comercial que sustenta o modelo de assinatura. O sucesso do MVP é definido por uma aplicação publicamente acessível, coberta por testes automatizados, que permita a um possível cliente real executar o fluxo completo — cadastrar ave, registrar ninhada com validações ativas, consultar a árvore e exportar um pedigree — e pela aprovação final de um revisor designado.

## Workspace

Repositório único em `/Users/gersonvan/dev/plantel_board`, ainda não inicializado como repositório git, que abrigará a aplicação Next.js completa (frontend e backend no mesmo projeto) — não há repositórios de referência separados. Não existe `CLAUDE.md` prévio; será criado durante a etapa de Rules. Não há documentos de requisitos externos no workspace — o caso de negócio e os requisitos completos foram levantados diretamente com o usuário ao longo da conversa de Context Gathering e estão consolidados neste Spec. O design visual (UI, design system) está sendo produzido externamente na ferramenta Claude Design e chega em paralelo à implementação.

A pasta `design/` no workspace contém o design final aprovado: mockups HTML de todas as telas do MVP e dois documentos de design system (`Design System.dc.html` com a direção visual escolhida — "Editorial Naturalista" — e `Design System - Direções.dc.html` com as alternativas descartadas). Esta pasta é a fonte oficial de estilo visual (paleta de cores, tipografia, componentes, layout) para a implementação do frontend — Workers de frontend devem referenciar esses arquivos diretamente em vez de depender de tokens de design duplicados neste Spec.

---

> **Notes:** O workspace ainda não é um repositório git — será necessário inicializá-lo antes do início da Stage 1. O usuário já possui acesso às contas de hospedagem (Vercel) e de banco de dados/serviços (Supabase) necessárias, e autorizou instalar quaisquer CLIs necessárias dentro deste mesmo ambiente de trabalho. O design visual da interface está sendo produzido externamente no Claude Design e chegará em paralelo à implementação — Tasks de frontend podem precisar de ajuste de guidance quando os artefatos de design estiverem disponíveis. Uma pessoa fará uma revisão externa final de aceite do MVP, além dos critérios de validação automatizados de cada Task — este é um gate de aceite holístico, a ser coordenado pelo Manager no momento apropriado, não uma Task planejada.

## Domínio e Modelo de Dados

### Cadastro Geral (Aves)

| Campo | Tipo / Regra |
|---|---|
| `anilha` | string, chave única por tenant. Identificador físico da anilha, inserido manualmente pelo usuário (corresponde ao código gravado na anilha física) — não é gerado pelo sistema. |
| `nome_apelido` | string, opcional. |
| `especie` | enum de lista gerenciável (ex: Canário Belga, Calopsita, Periquito Australiano) — não é texto livre. A lista inicial vem do design; deve ser extensível (novas espécies podem ser adicionadas sem alteração de schema). |
| `mutacao_cor` | string livre, opcional (ex: "Isabela", "Cara Branca"). |
| `sexo` | enum: Macho, Fêmea, Não Sexado. Obrigatório. |
| `data_nascimento` | date, opcional (pode ser desconhecida para aves adquiridas de terceiros). |
| `origem` | enum: Nascida no criatório, Adquirida. Obrigatório. Determina como a Árvore Genealógica trata ancestrais não rastreados: se uma ave é "Adquirida", seus pais são exibidos como "sem registro" (origem externa conhecida) em vez de "não registrado" (simplesmente nunca vinculado). |
| `anilha_pai` | referência a outra Ave do mesmo tenant, mesma `especie`, sexo Macho. Nullable. |
| `anilha_mae` | referência a outra Ave do mesmo tenant, mesma `especie`, sexo Fêmea. Nullable. |
| `status` | enum: Ativo, Reservado, Vendido, Óbito, Fugiu. Obrigatório, default Ativo. "Em ninhada" **não é um valor armazenado** — é um indicador calculado exibido na UI quando a ave está referenciada em uma Ninhada em andamento (ver Reprodução). |
| `foto` | upload de imagem, opcional. |

### Reprodução (Ninhadas)

| Campo | Tipo / Regra |
|---|---|
| `cod_ninhada` | string, **gerado automaticamente** no formato interno `AAAA-NN` (ano + sequência por tenant). Exibido na UI como rótulo curto "Ninhada #N" (apenas a sequência), mas o código completo `AAAA-NN` é o identificador armazenado. Editável pelo usuário se necessário. |
| `anilha_macho` | referência a uma Ave com `sexo = Macho`, mesma `especie` da Ninhada, Status = Ativo. |
| `anilha_femea` | referência a uma Ave com `sexo = Fêmea`, mesma `especie` da Ninhada, Status = Ativo. |
| `data_postura` | date. |
| `ovos_previstos` | int, nullable, opcional. Estimativa informada na criação da Ninhada, antes da postura efetiva — distinto de `ovos_botados` (contagem real, preenchida depois). |
| `ovos_botados` | int, nullable (preenchimento progressivo — nem sempre conhecido no momento do cadastro). |
| `ovos_ferteis` | int, nullable. |
| `filhotes_nascidos` | int, nullable. |
| `taxa_eclosao` | calculado = `filhotes_nascidos / ovos_botados`, exibido como percentual. Só exibido quando ambos os valores estão preenchidos (evitar divisão por zero/indefinido). |

Uma ninhada é criada com informação parcial e atualizada ao longo do tempo conforme os dados ficam disponíveis (postura → ovoscopia → nascimento). Enquanto uma Ninhada está em andamento (sem data de encerramento/resultado final), as duas aves referenciadas (`anilha_macho`, `anilha_femea`) exibem o indicador calculado "Em ninhada" na interface, sem alterar o campo `status` armazenado.

### Trava 1 — Restrição de seleção de reprodutores

Os campos `anilha_macho` e `anilha_femea`, ao criar uma Ninhada, são preenchidos via seleção (não digitação livre), restrita a aves já cadastradas no Cadastro Geral **da mesma espécie, com sexo compatível e Status = Ativo**. A restrição por Status é uma extensão sobre o pedido original (que só validava a existência da anilha): não faz sentido reproduzir uma ave já vendida ou com óbito registrado. A mesma restrição de espécie e sexo compatível se aplica à seleção de `anilha_pai`/`anilha_mae` no Cadastro Geral.

### Trava 2 — Coeficiente de parentesco e alerta de consanguinidade

Ao selecionar o casal (`anilha_macho`, `anilha_femea`) para uma nova Ninhada, o sistema calcula um **coeficiente de parentesco percentual** entre os dois, usando as três gerações rastreadas (pais e avós), pelo método padrão de contagem de caminhos genealógicos assumindo ancestrais desconhecidos como não-aparentados:

| Relação encontrada | Coeficiente |
|---|---|
| Pai/mãe-filho direto, ou irmãos completos (mesmo pai e mesma mãe) | 25% |
| Meio-irmãos (um dos pais em comum), ou relação avô/avó-neto | 12,5% |
| Um avô/avó em comum apenas (ex: primos de primeiro grau) | 6,25% |
| Nenhum ancestral em comum dentro das 3 gerações rastreadas | 0% |

Quando o coeficiente é maior que 0%, a interface exibe um alerta ("Atenção: risco de consanguinidade") com o percentual estimado e uma recomendação de revisão — **este alerta é apenas informativo e não bloqueia o cadastro da Ninhada**; o usuário pode prosseguir mesmo assim.

Nota de design: a fórmula original da planilha (`=OU(E($I2=$K2;...); ...; $B2=$K2; $C2=$I2)`) verificava apenas duas das quatro direções possíveis de relação direta pai/mãe-filho, e não produzia um percentual. Esta especificação substitui aquela checagem binária por um cálculo de coeficiente real, mais correto e alinhado ao design aprovado.

### Árvore Genealógica

Exibe a ave consultada, seus pais (2ª geração) e avós (3ª geração) — profundidade de 3 gerações, igual à especificação original. É navegável: o usuário pode clicar em qualquer nó da árvore para recentralizar a visualização nesse indivíduo. Os dados vêm diretamente das referências `anilha_pai`/`anilha_mae` armazenadas no Cadastro Geral — não requer uma tabela de relacionamento genealógico separada.

### Pedigree Exportável

Artefato central do modelo de assinatura. Gerado a partir da mesma estrutura de 3 gerações da Árvore Genealógica, em formato PDF, contendo: nome/apelido, anilha, espécie/mutação, sexo, data de nascimento, origem e foto (se houver) da ave consultada, seus pais e avós (marcando ancestrais desconhecidos como "Não registrado" ou "Adquirido — sem registro", conforme o campo `origem`), e a identidade do criatório (nome/logo definidos no onboarding da conta, mais o nome do responsável). Este é o documento que o criador compartilha/entrega ao vender um filhote.

O certificado inclui um código de verificação exibido no rodapé (ex: `PDG-0451-SV`). No MVP, este código é **apenas cosmético** — reforça a percepção de autenticidade do documento — e não requer uma página ou endpoint público de verificação/consulta.

## Arquitetura e Stack Técnica

- **Aplicação**: Next.js (TypeScript), fullstack — frontend e backend no mesmo projeto.
- **Banco de dados, autenticação e storage: Supabase.** Escolhido por unificar os três serviços (Postgres gerenciado, Auth, Storage de arquivos) em uma única plataforma, reduzindo a quantidade de integrações separadas necessárias para o MVP.
- **ORM**: Prisma, sobre a conexão Postgres do Supabase, para type-safety no Next.js.
- **Autenticação**: Supabase Auth (e-mail/senha). Cada conta de usuário corresponde a um criador/tenant.
- **Storage de arquivos**: Supabase Storage, para fotos de aves e pedigrees exportados.
- **Geração de PDF do pedigree**: `@react-pdf/renderer` (renderização React→PDF em JavaScript puro), evitando dependência de navegador headless (Puppeteer/Playwright) em ambiente serverless.
- **Hospedagem**: Vercel para a aplicação; Supabase para banco/auth/storage (ambos gerenciados).
- **Testes**: Vitest para lógica de negócio (cálculo de taxa de eclosão, cálculo do coeficiente de parentesco); Playwright para o fluxo ponta a ponta (cadastro de ave → ninhada → árvore → exportação de pedigree) contra o ambiente publicado.

## Multi-tenancy e Isolamento de Dados

Cada conta (criador/criatório) é um tenant, com seus dados isolados dos demais por padrão — requisito fundacional confirmado pelo usuário, não uma adição posterior.

**Estratégia escolhida: isolamento na camada de aplicação**, não Row-Level Security nativa do Postgres. Toda tabela de domínio (Cadastro Geral, Reprodução) carrega uma referência ao tenant. Um middleware do Prisma aplica automaticamente o filtro por tenant em toda consulta, evitando que uma consulta esquecida vaze dados entre contas.

Razão da escolha: o Prisma opera sobre uma conexão/pool compartilhada, não a conexão autenticada por usuário do Supabase — fazer RLS nativa funcionar corretamente exigiria configuração adicional não trivial (propagar o contexto do usuário autenticado até a sessão do Postgres a cada consulta). Para o prazo do MVP, o isolamento por middleware é mais simples de implementar corretamente. RLS nativa fica como evolução futura possível, não descartada permanentemente.

## Escopo do MVP

**Dentro do escopo:**
- Cadastro Geral de aves (com foto).
- Reprodução/Ninhadas com as travas 1 e 2.
- Árvore Genealógica navegável (3 gerações).
- Pedigree exportável em PDF.
- Autenticação de usuários.
- Multi-tenancy (isolamento de dados por conta desde o início).
- Aplicação publicamente acessível (deploy).
- Testes automatizados (unitários e ponta a ponta).
- Notas de uso (documentação para o usuário final).

**Fora do escopo (adiado para versões futuras):**
- Billing/assinatura paga.
- Saúde/medicamentos, import de dados do IBAMA, módulo financeiro, registro de concursos.
- Aplicativo nativo (iOS/Android) — apenas web responsivo nesta versão.
- Suporte a múltiplos idiomas — apenas português.

## Implantação

A aplicação deve estar publicamente acessível (deploy em produção na Vercel, banco/auth/storage no Supabase) — este é um critério de sucesso do MVP, não um passo final opcional, pois a validação exige que um possível cliente real consiga testá-la. A aprovação final do MVP inclui uma revisão externa por uma pessoa designada, além da cobertura de testes automatizados de cada entrega.
