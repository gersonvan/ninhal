APM_RULES {

## Isolamento Multi-tenant

Toda tabela de domínio armazena dados de múltiplos criadores (tenants) na mesma base. Qualquer leitura ou escrita em dados de domínio (aves, ninhadas, ou qualquer entidade futura vinculada a uma conta) deve passar pelo mecanismo de isolamento por tenant já estabelecido no projeto — nunca escrever uma consulta direta que ignore esse filtro, mesmo que pareça mais simples para um caso específico. Um vazamento de dados entre contas é uma falha crítica de segurança, não um bug menor.

## Fidelidade ao Design Aprovado

Este projeto tem um design visual já aprovado na pasta `design/` (mockups HTML por tela e um documento de design system com paleta de cores, tipografia e componentes). Qualquer trabalho de interface deve seguir esses arquivos como referência direta — layout, componentes, cores, tipografia e textos de exemplo. Não introduza padrões visuais, componentes ou variações de layout que não estejam representados ali. Se uma tela ou estado não estiver coberto pelo design existente, reutilize os componentes e tokens já estabelecidos para manter consistência, em vez de criar um estilo novo.

## Cobertura de Testes Automatizados

Testes automatizados são parte da definição de "concluído" para qualquer entrega — não apenas verificação manual. Lógica de negócio (cálculos, validações, regras de acesso) precisa de testes unitários; fluxos de usuário completos precisam de cobertura ponta a ponta quando aplicável. Uma funcionalidade sem teste correspondente não está pronta, independentemente de funcionar quando testada manualmente.

## Acesso a Credenciais e Serviços Externos

Nunca invente, assuma ou deixe como placeholder um valor de credencial, chave de API, ou identificador de conta de serviços externos (hospedagem, banco de dados, storage). Quando uma tarefa exigir esse tipo de acesso, pare o trabalho e peça explicitamente ao usuário o valor ou a ação necessária antes de prosseguir.

## Reaproveitamento de Lógica Existente

Antes de implementar uma lógica que possa já existir de um trabalho anterior no mesmo projeto (por exemplo, cálculos, validações ou serviços compartilhados), procure e reaproveite o que já foi construído em vez de duplicar a implementação. Duplicação de lógica de negócio cria divergência e dificulta manutenção.

## Idioma

Toda a interface e qualquer texto voltado ao usuário final (rótulos, mensagens, alertas, documentação de uso) deve ser escrito em português do Brasil.

## Testes de Cadastro e E-mail

O Supabase sinalizou uma taxa alta de e-mails retornados (bounce) por cadastros de teste usando endereços fabricados/inexistentes (ex: `teste@example.com`), o que arrisca restrição do envio de e-mails transacionais do projeto. Qualquer cadastro de usuário real contra o projeto Supabase (desenvolvimento, produção, ou testes automatizados que não usem mocks) deve usar um endereço de e-mail real e entregável — por exemplo, um endereço próprio do usuário com alias `+` (ex: `gersonvan+ninhal-teste1@gmail.com`), nunca um domínio fictício. Isso vale para verificação manual, dados de teste em Task Prompts, e a suíte Playwright ponta a ponta.

## Controle de Versão

Repositório: `/Users/gersonvan/dev/plantel_board`, branch base `main`, remoto `origin` em `https://github.com/gersonvan/ninhal.git` (pushes apenas quando explicitamente solicitados). Branches de feature seguem `tipo/descricao-curta` (ex: `feat/cadastro-de-aves`). Commits seguem `tipo: descrição`, com tipos `feat`, `fix`, `refactor`, `docs`, `test`, `chore`.

} //APM_RULES
