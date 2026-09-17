## Purpose

Define a tela de perfil — os campos de conta (nome, e-mail), a troca de
senha, a validação no cliente antes de incomodar o backend, e o que a
tela garante a quem navega por teclado ou usa leitor de tela.

## ADDED Requirements

### Requirement: Telas construídas sobre o design system

A tela de perfil SHALL ser montada com os componentes base existentes e
obter cor, espaçamento e tipografia dos tokens do design system.

Ela NÃO SHALL introduzir valor visual literal nem um botão ou campo
próprio quando o componente equivalente já existe.

#### Scenario: Componentes reaproveitados
- **WHEN** a tela de perfil é exibida
- **THEN** campos, botões e mensagens usam os componentes base do design
  system

#### Scenario: Temas claro e escuro
- **WHEN** a tela é exibida em qualquer um dos dois temas
- **THEN** permanece legível, seguindo o tema ativo pelos tokens

### Requirement: Alcançável de qualquer tela protegida

A área autenticada SHALL oferecer um caminho visível até a tela de perfil,
alcançável de qualquer tela protegida.

#### Scenario: Link visível
- **WHEN** uma tela protegida é exibida
- **THEN** um caminho até a tela de perfil está alcançável

#### Scenario: Abrir o perfil
- **WHEN** esse caminho é acionado
- **THEN** o usuário é levado à tela de perfil

### Requirement: Edição de nome e e-mail

A tela de perfil SHALL exibir o nome e o e-mail atuais do usuário
autenticado, pré-preenchidos, e SHALL permitir editá-los e salvar.

#### Scenario: Edição bem-sucedida
- **WHEN** um novo nome e/ou e-mail são aceitos pelo backend
- **THEN** a tela passa a exibir os novos valores, e são eles que aparecem
  em qualquer outro lugar da aplicação que mostre a identidade do usuário

#### Scenario: E-mail já usado por outra conta
- **WHEN** o e-mail informado já pertence a outra conta
- **THEN** a recusa do backend é exibida, atribuída ao campo de e-mail
  quando o backend indicar esse campo

### Requirement: Troca de senha em formulário à parte

A tela de perfil SHALL oferecer a troca de senha como uma ação distinta da
edição de nome/e-mail, revelando um formulário próprio com os campos de
senha atual e nova senha somente quando acionada.

A senha atual SHALL ser exigida para confirmar a troca.

#### Scenario: Troca bem-sucedida
- **WHEN** a senha atual confere e a nova senha é aceita pelo backend
- **THEN** a tela informa que a senha foi trocada
- **AND** o formulário de troca de senha volta a ficar oculto

#### Scenario: Senha atual incorreta
- **WHEN** a senha atual informada não confere
- **THEN** a recusa do backend é exibida como erro geral do formulário de
  troca de senha, e a sessão atual permanece ativa

#### Scenario: Cancelar a troca
- **WHEN** a troca de senha é cancelada antes de salvar
- **THEN** o formulário de troca de senha volta a ficar oculto, sem
  nenhuma requisição enviada

### Requirement: Validação no cliente espelhando as regras do backend

Antes de enviar, os formulários de conta e de troca de senha SHALL validar
os campos com as mesmas regras que o backend aplica — presença, formato de
e-mail, e os limites de tamanho de nome e de senha.

A validação no cliente SHALL servir para dar resposta imediata, e NÃO SHALL
ser tratada como a garantia: a recusa do backend continua sendo a palavra
final e SHALL ser exibida quando ocorrer.

Recusa na validação local SHALL NOT gerar requisição ao backend.

#### Scenario: Nome vazio
- **WHEN** a edição de conta é acionada com o nome vazio
- **THEN** o campo é marcado como inválido e nenhuma requisição é enviada

#### Scenario: E-mail em formato inválido
- **WHEN** a edição de conta é acionada com um e-mail em formato inválido
- **THEN** o campo é marcado como inválido e nenhuma requisição é enviada

#### Scenario: Nova senha curta demais
- **WHEN** a troca de senha é acionada com a nova senha menor que o
  mínimo aceito
- **THEN** o campo é marcado como inválido e nenhuma requisição é enviada

#### Scenario: Backend recusa o que passou localmente
- **WHEN** os dados passam pela validação local e o backend os recusa
- **THEN** a recusa do backend é exibida na tela, atribuída ao campo
  correspondente quando o backend indicar qual campo falhou

### Requirement: Estado de envio em curso

Durante o envio de qualquer um dos dois formulários, a tela SHALL indicar
que a operação está em curso e SHALL impedir novo envio do mesmo
formulário até que o resultado chegue.

#### Scenario: Envio em curso
- **WHEN** um dos formulários está sendo enviado
- **THEN** a ação exibe estado de carregamento
- **AND** acioná-la de novo não dispara outra requisição

#### Scenario: Erro libera o formulário
- **WHEN** o envio termina em falha
- **THEN** a ação volta a estar disponível para nova tentativa

### Requirement: Formulários acessíveis por teclado e a leitores de tela

Cada campo dos formulários de conta e de troca de senha SHALL ter rótulo
programaticamente associado ao seu controle, e cada mensagem de erro de
campo SHALL estar associada ao campo correspondente.

Os formulários SHALL poder ser enviados pelo teclado, sem exigir clique no
botão.

#### Scenario: Envio pelo teclado
- **WHEN** o usuário pressiona Enter com o foco em um campo de um desses
  formulários
- **THEN** o formulário é enviado

#### Scenario: Erro alcançável por leitor de tela
- **WHEN** um campo é marcado como inválido
- **THEN** a mensagem de erro está associada ao campo, e não apenas
  próxima dele na tela
