---
title: Ninhal
---

# APM Memory Index

## Memory Notes

- **Fase 2:** a biblioteca `pdf-parse` (v2.4.5, `lib/importacao-ibama/parser.ts`) trava com `DataCloneError` se `getText()` e `getTable()` forem chamados em paralelo (`Promise.all`) na mesma instância do parser — descoberto na Task 2.2. Chamar sempre sequencialmente na mesma instância. Relevante para qualquer Task futura que reaproveite este parser (ex: Task 2.4, tela de revisão da importação).

- Prisma 7 removeu o middleware `$use` e o `Prisma.dmmf` público no client gerado; `PrismaClient` exige um adapter de driver explícito (`@prisma/adapter-pg`). O isolamento multi-tenant é aplicado via `$extends` sobre uma lista manual de modelos (`lib/tenant/scoped-models.ts`, `TENANT_SCOPED_MODELS`) — toda tabela de domínio nova (Ave, Ninhada) precisa ser registrada manualmente nessa lista além de ganhar o campo `tenantId`; não há detecção automática.
- A conexão do Prisma com o Supabase só funciona neste ambiente via connection pooler (Supavisor) — o host de conexão direta resolve apenas por IPv6, inalcançável na rede local. Qualquer nova configuração de ambiente (local, CI, deploy) deve usar a string do pooler.
- Cadastros de teste contra o projeto Supabase devem usar e-mails reais e entregáveis (ex: alias `+` em um endereço real) — o projeto recebeu aviso de alta taxa de bounce por testes com endereços fabricados, com risco de restrição do envio de e-mails. Regra registrada em CLAUDE.md.
- A confirmação de e-mail obrigatória do Supabase Auth foi desabilitada pelo usuário e confirmada via teste real de cadastro (2026-07-03) — login imediato após cadastro funciona normalmente, não bloqueia mais a Stage 5 (testes E2E).
- **Resolvido (Task 3.6):** `runWithTenant` agora aguarda o callback internamente, sendo seguro por construção mesmo se o chamador passar uma função comum (não `async`) que apenas repassa a promise do Prisma. A causa raiz documentada nas Tasks 2.1/3.5 ("toda chamada sem `await` interno perde o contexto") estava mais ampla do que a realidade — o problema só ocorria com callbacks não-`async`; funções `async` sem `await` explícito já eram seguras por acidente (a adoção da promise ainda cai dentro da janela síncrona). Não há mais nenhum cuidado especial a observar em código novo que use `runWithTenant`.
- Coeficiente de parentesco (Task 3.2): a tabela de casos do Spec não cobre todas as combinações possíveis — primos cujos pais são apenas meio-irmãos (compartilham um único avô) produzem 3,125% pelo método padrão, um valor entre "avô/avó em comum" (6,25%) e "nenhum parentesco" (0%). Documentado e testado, mas nenhuma decisão de UI foi tomada sobre como exibir esse caso — relevante se a Stage 4/5 precisar de uma faixa de alerta mais granular.
- Status calculado de Ninhada (Task 3.4, não persistido): "Encerrada" quando `filhotesNascidos` não é nulo; "Risco genético" quando a preferência `alertasConsanguinidadeAtivados` do tenant está ativada E o coeficiente de parentesco do casal é maior que zero; "Em curso" caso contrário. Reaproveitar essa mesma lógica de classificação para o banner de ninhada ativa da Árvore Genealógica (Task 4.2), em vez de recriar as três variantes.
- `Especie` foi modelada como catálogo compartilhado (não tenant-scoped) — decisão do Worker por inferência, sem tenant customizado por criatório neste MVP. Se o produto precisar de espécies customizadas por tenant no futuro, isso exige uma Task nova para tornar `Especie` tenant-scoped.
- O nome completo do responsável é coletado no cadastro (Task 1.3) mas nunca foi persistido — deficiência descoberta na Task 4.3 (o certificado de pedigree usava o e-mail como alternativa). Corrigido pela Task 4.5, adicionada ao Plano com aprovação do usuário.
- As fontes do certificado de pedigree (`@react-pdf/renderer`) usam as famílias embutidas (Times/Helvetica/Courier) em vez de Source Serif 4/Manrope/Space Grotesk do design, por falta de arquivo de fonte licenciado disponível — aceito pelo usuário por ora. Revisitar se o usuário fornecer os arquivos TTF/OTF das fontes corretas.
- Políticas de RLS de bucket do Supabase Storage criadas pela UI podem ficar restritas a um nome de pasta literal (padrão de policy "dar acesso à pasta X" gerado pelo wizard), em vez de liberar o bucket inteiro — isso bloqueia uploads para caminhos diferentes do esperado mesmo com uma policy aparentemente correta. Ao configurar Storage, preferir policies explícitas por `bucket_id` (`with check (bucket_id = 'nome-do-bucket')`) em vez de aceitar o padrão de pasta do wizard. Vale reconferir o bucket `logos` (Onboarding, Stage 1) com o mesmo teste real usado para `fotos-aves`, caso surjam problemas de upload de logo.
- Ambiente de testes (Vitest/E2E) compartilha o mesmo banco/pool do Supabase com produção — causa raiz de contenção transitória (`EMAXCONNSESSION`) observada repetidamente desde a Stage 3. Usuário decidiu adiar a separação de ambientes (exigiria projeto Supabase dedicado a testes, com credencial nova) para depois do MVP.
- Suíte E2E (`e2e/fluxo-completo.spec.ts`, Playwright) tem os 7 testes validados individualmente contra produção real, mas nunca todos juntos em uma única rodada 100% limpa (mesma contenção do item acima, não erro de lógica). Por decisão do usuário, rodar a suíte completa novamente sempre que uma nova melhoria/funcionalidade for adicionada ao projeto.
- Catálogo de `Especie` em produção precisou ser semeado manualmente pelo Manager antes do lançamento (Canário Belga, Calopsita, Periquito Australiano) — nenhuma Task do Plano incluía um passo explícito de seed inicial; qualquer evolução futura do catálogo de espécies deve ser feita com o mesmo cuidado (dado real, não placeholder).
- Usuário trouxe materiais de referência de uma ferramenta concorrente (MyBirds) — salvos em `design/referencias-externas/` (não fazem parte do design aprovado). Mostram um formato de "carteira" compacta e uma árvore de 5 gerações (vs. as 3 gerações do MVP atual) — relevante apenas se houver interesse em discutir extensões futuras do pedigree.

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

### Stage 2 - Cadastro Geral (Aves)

Stage concluída com as 4 Tasks executadas sequencialmente pelo Fullstack Agent (mesma instância, sem Handoffs) na branch `feat/cadastro-geral-aves`, mergeada para `main` ao final da Stage. Entregou: modelos `Ave` (tenant-scoped) e `Especie` (catálogo compartilhado) com API CRUD completa e regras de negócio (unicidade de anilha por tenant, compatibilidade de espécie/sexo entre pai/mãe) testadas por integração contra o banco real; tela Lista do Plantel com busca e filtros por espécie/sexo/status; tela Novo Cadastro de Ave com upload de foto e dropdowns de pai/mãe filtrados dinamicamente; e tela Ficha da Ave com visualização, edição e mudança de status.

Achado técnico relevante: durante a Task 2.1, o Worker descobriu e corrigiu um bug de propagação de contexto no middleware de isolamento multi-tenant — chamadas ao Prisma dentro de `runWithTenant` sem `await` interno perdem o contexto de tenant (falha seguramente com erro, não vaza dados, mas quebra a operação). Documentado como padrão a observar em toda Task futura que use o mesmo middleware. Todas as três telas fizeram omissões conscientes e bem justificadas do mockup por ausência de modelo de dados de suporte (indicador "Em ninhada", seção "Histórico" da Ficha, chip de filtro "Em ninhada"), consistentes com o escopo explícito das Tasks e com a regra de fidelidade ao design (reaproveitar tokens existentes em vez de inventar padrões novos). Uma verificação holística ao final da Stage encontrou que o upload real de fotos para o bucket `fotos-aves` falhava com erro de RLS (`403`, apesar de policies aparentemente configuradas) — causa raiz: a policy gerada pela UI do Supabase estava restrita a um nome de pasta literal em vez de liberar o bucket inteiro. Corrigido diretamente via SQL (novas policies de `insert`/`select` por `bucket_id`), com upload e leitura pública confirmados por teste real antes de fechar a Stage.

**Task Logs:**
- task-02-01.log.md
- task-02-02.log.md
- task-02-03.log.md
- task-02-04.log.md

### Stage 3 - Reprodução e Travas de Segurança

Stage concluída com 6 Tasks (a Task 3.6 foi adicionada ao Plano durante a Stage) executadas sequencialmente pelo Fullstack Agent (mesma instância, sem Handoffs) na branch `feat/ninhadas-modelo-api`, mergeada para `main` ao final da Stage. Entregou: modelo `Ninhada` (tenant-scoped) com geração automática de código por tenant/ano e cálculo de taxa de eclosão; a Trava 1 (espécie/sexo/status Ativo na seleção do casal); o coeficiente de parentesco (Trava 2) usando o método recursivo correto de kinship coefficient, com um caso ambíguo da tabela do Spec identificado, testado e documentado em vez de decidido silenciosamente; as telas de Nova Ninhada (com alerta de consanguinidade em tempo real, não bloqueante), Lista de Ninhadas, Detalhe da Ninhada (com preenchimento progressivo e o fluxo "gerar filhotes") e o indicador retroativo "Em ninhada" no Cadastro Geral.

O Spec precisou de um esclarecimento do Manager durante a Stage: como o schema de Ninhada não tem campo de encerramento separado, "em andamento" foi definido operacionalmente como `filhotesNascidos` nulo — definição reaproveitada consistentemente pelas Tasks seguintes (status calculado "Em curso/Risco genético/Encerrada"). O bug de propagação de contexto documentado na Stage 2 (Task 2.1) reincidiu uma segunda vez na Task 3.5 (desta vez em código de teste), levando o usuário a aprovar a Task 3.6 como reforço estrutural — que investigou a fundo e descobriu que a causa raiz registrada anteriormente estava mais ampla do que a realidade (o problema só ocorria com callbacks não-`async` repassando a promise do Prisma diretamente). `runWithTenant` foi corrigido para aguardar o callback internamente, tornando o padrão seguro por construção; o entendimento anterior foi corrigido nos registros de Memory. Nenhuma verificação holística adicional foi necessária ao final da Stage — as Tasks já cobriram os pontos de risco (cálculo de parentesco, isolamento multi-tenant) com testes de integração contra o banco real.

**Task Logs:**
- task-03-01.log.md
- task-03-02.log.md
- task-03-03.log.md
- task-03-04.log.md
- task-03-05.log.md
- task-03-06.log.md

### Stage 4 - Árvore Genealógica e Pedigree Exportável

Stage concluída com 5 Tasks (a Task 4.5 foi adicionada ao Plano durante a Stage) executadas sequencialmente pelo Fullstack Agent (mesma instância, sem Handoffs) na branch `feat/arvore-genealogica-servico`, mergeada para `main` ao final da Stage. Entregou: o serviço de montagem da árvore genealógica de 3 gerações (reaproveitando o padrão de consulta aninhada já usado no coeficiente de parentesco), com rotulagem de ancestrais ausentes ("Não registrado/a" vs. "Adquirido/a — sem registro" conforme a origem do ancestral conhecido mais próximo); a tela navegável da Árvore Genealógica com banner de ninhada ativa (reaproveitando a classificação de status "Em curso/Risco genético/Encerrada" da Stage 3); o certificado de pedigree em PDF via `@react-pdf/renderer`, usando a mesma estrutura de 3 gerações como única fonte de ancestralidade; e a tela de Exportar Pedigree ligada à geração de PDF já existente.

Durante a Task 4.3, o Worker descobriu que o nome completo do responsável — coletado no formulário de cadastro desde a Task 1.3 (Stage 1) — nunca havia sido persistido em lugar nenhum, usando o e-mail do usuário como alternativa no certificado. O usuário aprovou a Task 4.5 para corrigir a causa raiz: o nome agora é persistido em `user_metadata.full_name` do Supabase Auth durante o cadastro, com o e-mail preservado apenas como alternativa para contas criadas antes da correção. A Task 4.3 também substituiu as fontes do design (Source Serif 4/Manrope/Space Grotesk) pelas famílias embutidas do React-PDF no certificado, por não haver arquivo de fonte licenciado disponível — divergência aceita pelo usuário por ora, mantendo a hierarquia visual (serif/sans/mono) ainda que com fontes diferentes. A Task 4.4 resolveu um conflito de rota do Next.js (page.tsx e route.ts não podem coexistir no mesmo segmento), movendo a geração de PDF para uma sub-rota (`/pedigree/download`) e liberando o caminho principal para a nova tela de exportação. Nenhuma verificação holística adicional foi necessária ao final da Stage.

**Task Logs:**
- task-04-01.log.md
- task-04-02.log.md
- task-04-03.log.md
- task-04-04.log.md
- task-04-05.log.md

### Stage 5 - Validação Ponta a Ponta e Entrega

Stage concluída com as 4 Tasks executadas sequencialmente pelo Fullstack Agent (mesma instância, sem Handoffs), consolidadas nas branches `feat/configuracoes-conta` e `feat/deploy-final-checklist`, ambas mergeadas para `main`. Entregou: a tela de Configurações (edição de perfil/criatório, primeira escrita da preferência de alertas de consanguinidade, logout); o guia de uso do produto para o usuário final; a suíte de testes E2E Playwright cobrindo o fluxo completo (cadastro → onboarding → cadastro de ave → ninhada com as duas Travas → árvore genealógica → pedigree); e o deploy final com o checklist de aceite do MVP preenchido e confirmado contra a URL pública de produção (`https://plantelboard.vercel.app`).

Uma verificação holística durante a revisão da Task 5.3 encontrou dois problemas de infraestrutura fora do escopo de qualquer Task individual: (1) o banco de produção continha tenants/aves/ninhadas de teste órfãos, resultado de execuções anteriores de Vitest e da própria suíte E2E contra o mesmo banco compartilhado — removidos diretamente pelo Manager; (2) o catálogo de `Especie` em produção, com o lixo de teste removido, ficou vazio, pois nenhuma Task do Plano incluía um passo de seed inicial — semeado pelo Manager com a lista de exemplo do Spec (Canário Belga, Calopsita, Periquito Australiano) antes do deploy final. A causa raiz da instabilidade transitória observada em múltiplas Stages (`EMAXCONNSESSION`) foi finalmente identificada: falta de separação entre os ambientes de desenvolvimento, teste e produção, todos compartilhando o mesmo projeto Supabase — o usuário decidiu adiar essa separação para depois do MVP. A suíte E2E teve todos os 7 testes validados individualmente contra produção real, mas nunca uma execução completa 100% limpa da suíte inteira em uma única rodada; o usuário aceitou essa evidência como suficiente, com a orientação de rodar a suíte completa novamente a cada nova funcionalidade futura. A Task 5.4 também corrigiu, por conta própria, um deploy de produção desatualizado (redeploy feito antes da verificação final) e documentou de forma transparente uma limitação de ferramental (automação de upload de arquivo real não suportada pelo navegador de teste) sem mascará-la como item concluído.

Durante a Stage, o usuário também compartilhou materiais de referência de uma ferramenta concorrente (MyBirds) — um "Certificado" de 5 gerações e uma "carteira" compacta — salvos em `design/referencias-externas/` apenas como inspiração para consideração futura, sem qualquer alteração de escopo do MVP atual.

**Task Logs:**
- task-05-01.log.md
- task-05-02.log.md
- task-05-03.log.md
- task-05-04.log.md
