# Guia de Uso do Ninhal

Bem-vindo(a) ao Ninhal! Este guia explica, passo a passo, como usar o sistema no dia a dia do seu criatório: do cadastro da conta até a exportação do pedigree de uma ave.

---

## 1. Criando sua conta e configurando o criatório

### 1.1 Cadastro

Na tela inicial, escolha a aba **"Criar conta"** e preencha:

- **Nome completo** — seu nome, usado depois como responsável técnico no certificado de pedigree.
- **E-mail** — use um e-mail real que você acesse, pois é para ele que vamos confirmar sua conta.
- **Senha** — mínimo de 6 caracteres.

Depois de criar a conta, você é levado direto para a configuração do seu criatório (não é necessário confirmar o e-mail antes de continuar usando o sistema).

### 1.2 Onboarding (configuração inicial do criatório)

Esse é um processo rápido de 3 passos, feito uma única vez:

1. **Nome do criatório** — o nome que aparece no seu pedigree e nos documentos compartilhados com clientes (ex: "Aviário Serra Verde").
2. **Foco de criação** — escolha uma ou mais espécies que você cria (Canários, Calopsitas, Psitacídeos, Outras aves ornamentais). Isso ajusta os campos disponíveis no cadastro do plantel.
3. **Logo do criatório** — opcional. Você pode enviar agora ou pular e adicionar depois pela tela de Configurações.

Ao concluir, você chega ao painel principal (Início).

---

## 2. Cadastrando aves e usando a Lista do Plantel

### 2.1 Cadastrando uma nova ave

No menu, acesse **Plantel** e toque no botão de adicionar (o "+"). Preencha:

- **Foto** — opcional, toque no círculo para escolher uma imagem.
- **Nome/apelido** — opcional.
- **Anilha** — obrigatório (ex: `BR-2026-0000`). É o identificador único da ave.
- **Sexo** — Macho, Fêmea ou Não sexado.
- **Espécie** — selecione entre as espécies cadastradas.
- **Mutação/cor** — opcional (ex: "Isabela").
- **Nascimento** — data de nascimento, opcional.
- **Origem** — escolha entre **"Nascida no criatório"** ou **"Adquirida"**.
- **Genealogia (Pai/Mãe)** — os campos de Pai e Mãe só mostram aves que **já estão cadastradas no seu plantel** e que sejam compatíveis (Pai: machos; Mãe: fêmeas). Se os pais não estiverem no plantel, deixe como "Nenhum/desconhecido" e marque a origem como "Adquirida" — o sistema vai avisar sobre isso no formulário.

### 2.2 Consultando e filtrando o plantel

Na tela **Lista do Plantel**, você pode:

- Buscar por **nome ou anilha** (a busca já filtra os resultados enquanto você digita).
- Filtrar por **sexo** (Machos/Fêmeas).
- Filtrar por **espécie** (um filtro para cada espécie do seu criatório).
- Filtrar por **status** (ex: Ativo, e outros status configurados).

Cada card do plantel mostra a foto, nome/anilha, espécie e sexo, além de indicar quando a ave está **"Em ninhada"** — ou seja, participando de uma ninhada em andamento.

### 2.3 Ficha da ave

Toque em qualquer ave da lista para abrir sua **ficha**, onde você encontra:

- Foto, nome, espécie, sexo e anilha.
- Nascimento, mutação/cor e origem.
- **Genealogia**: cartões do Pai e da Mãe (quando conhecidos) — toque neles para ir direto à ficha desse ancestral.
- Link **"Ver árvore genealógica completa"**.
- Botões **"Voltar ao plantel"** e **"Gerar pedigree"** (veja a seção 4).

Você pode editar qualquer um desses dados diretamente na ficha, incluindo o status da ave (ex: marcar como inativa).

---

## 3. Criando ninhadas

Acesse **Ninhadas** no menu e toque em adicionar uma nova ninhada. Você vai selecionar um casal reprodutor e acompanhar o processo até o nascimento dos filhotes.

### 3.1 Trava 1 — só reprodutores compatíveis aparecem

Os campos de seleção do **Macho** e da **Fêmea** só mostram aves que:

- são da **mesma espécie**;
- têm o **sexo correto** para o campo (machos no campo Macho, fêmeas no campo Fêmea);
- estão com status **Ativo**.

Ou seja, você nunca vai conseguir selecionar acidentalmente um casal incompatível — os próprios campos já vêm filtrados, então não existe uma mensagem de erro para essa trava: se uma ave não aparece na lista, é porque ela não atende a um desses critérios.

### 3.2 Trava 2 — alerta de consanguinidade

Assim que você seleciona o Macho e a Fêmea, o sistema calcula automaticamente o **parentesco entre os dois** e mostra um aviso:

- Se houver parentesco (ex: pai e filha, irmãos), aparece um alerta: **"Atenção: risco de consanguinidade — Coeficiente de parentesco estimado: X%"**.
- Se não houver parentesco direto identificado, aparece uma mensagem de confirmação tranquilizadora.

**Importante:** esse alerta é apenas informativo. Ele **não impede** a criação da ninhada — a decisão de prosseguir ou não com um casal consanguíneo é sempre sua. O objetivo é te dar essa informação na hora certa, antes de formar o casal.

### 3.3 Acompanhamento progressivo da ninhada

Ao criar a ninhada, você informa:

- **Data da postura** (obrigatória).
- **Ovos previstos** (opcional).

Depois, na ficha da ninhada, use **"Atualizar acompanhamento"** para preencher, conforme o processo avança:

- **Ovos botados**
- **Ovos férteis** (após a ovoscopia)
- **Filhotes nascidos**

Assim que você informar tanto "Ovos botados" quanto "Filhotes nascidos", o sistema calcula automaticamente a **taxa de eclosão** (filhotes nascidos ÷ ovos botados) e mostra o percentual em destaque na ficha da ninhada.

Quando os filhotes nascerem, use o link **"Gerar filhotes na árvore"** para cadastrá-los rapidamente no plantel — o formulário já vem com pai, mãe e espécie preenchidos.

---

## 4. Árvore genealógica e exportação do pedigree

### 4.1 Consultando a árvore genealógica

Acesse pela ficha de uma ave ("Ver árvore genealógica completa") ou pela ficha de uma ninhada em andamento. A árvore mostra três gerações:

- a ave selecionada, em destaque, no centro;
- pai e mãe, na linha acima;
- os quatro avós, na linha seguinte.

Ancestrais desconhecidos aparecem indicados como tal (ex: "Não registrado" ou "Adquirido — sem registro"). **Você pode clicar em qualquer ancestral conhecido para "recentralizar" a árvore nele** — ou seja, ver a árvore genealógica completa a partir daquele avô ou avó, navegando geração a geração.

### 4.2 Exportando o pedigree em PDF

Na ficha da ave, toque em **"Gerar pedigree"** para abrir a tela de exportação. Lá você encontra:

- Uma prévia do certificado de pedigree, com os dados da ave, a árvore genealógica de três gerações, o nome do criatório e do responsável técnico, e um código de verificação.
- O botão **"Exportar PDF"**, que baixa o certificado pronto para impressão ou envio a um cliente.

Os botões "Imagem" e "Compartilhar" ficam disponíveis na tela, mas por enquanto a única forma de exportação funcional é o PDF.

---

## 5. Configurações da conta e do criatório

Acesse **Configurações** no menu para:

- **Editar seu perfil**: nome do responsável (usado no pedigree).
- **Editar os dados do criatório**: nome, logo e foco de criação.
- **Ativar ou desativar os alertas de consanguinidade**: quando desativado, o casal ainda pode ser formado normalmente, mas o aviso da seção 3.2 deixa de ser exibido nas próximas ninhadas.
- **Notificações por e-mail**: disponível na tela, mas ainda não envia notificações reais neste momento.
- **Sair da conta**.

---

Este guia cobre o fluxo completo do MVP do Ninhal. Se tiver dúvidas sobre alguma tela específica, consulte a seção correspondente acima.
