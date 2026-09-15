# auth/screens Specification

## Purpose

Define as telas pelas quais alguém entra no mem-words ou cria sua conta — que
campos existem, o que é validado antes de incomodar o backend, como cada tipo
de recusa é comunicado e o que a tela garante a quem navega por teclado ou usa
leitor de tela.

## Requirements

### Requirement: Telas construídas sobre o design system

As telas de entrada e de cadastro SHALL ser montadas com os componentes base
existentes e obter cor, espaçamento e tipografia dos tokens do design system.

Nenhuma delas SHALL introduzir valor visual literal nem um botão ou campo
próprio quando o componente equivalente já existe.

#### Scenario: Componentes reaproveitados
- **WHEN** as telas de entrada e cadastro são exibidas
- **THEN** campos, botões e mensagens usam os componentes base do design system

#### Scenario: Temas claro e escuro
- **WHEN** as telas são exibidas em qualquer um dos dois temas
- **THEN** permanecem legíveis, seguindo o tema ativo pelos tokens

### Requirement: Tela de entrada

A tela de entrada SHALL oferecer os campos de e-mail e senha e a ação de
entrar, e SHALL oferecer caminho visível para a tela de cadastro.

#### Scenario: Entrada bem-sucedida
- **WHEN** as credenciais informadas são aceitas
- **THEN** o usuário é levado à área autenticada

#### Scenario: Caminho para o cadastro
- **WHEN** a tela de entrada é exibida
- **THEN** há um caminho visível para criar uma conta

### Requirement: Tela de cadastro

A tela de cadastro SHALL oferecer os campos de nome, e-mail e senha e a ação
de criar conta, e SHALL oferecer caminho visível para a tela de entrada.

Concluído o cadastro, o usuário SHALL ser levado à área autenticada sem
precisar digitar as credenciais outra vez.

#### Scenario: Cadastro bem-sucedido
- **WHEN** os dados informados são aceitos
- **THEN** a conta é criada e o usuário é levado à área autenticada

#### Scenario: Caminho para a entrada
- **WHEN** a tela de cadastro é exibida
- **THEN** há um caminho visível para quem já tem conta

### Requirement: Validação no cliente espelhando as regras do backend

Antes de enviar, as telas SHALL validar os campos com as mesmas regras que o
backend aplica — presença dos campos obrigatórios, formato de e-mail, e os
limites de tamanho de nome e de senha.

A validação no cliente SHALL servir para dar resposta imediata, e NÃO SHALL
ser tratada como a garantia: a recusa do backend continua sendo a palavra
final e SHALL ser exibida quando ocorrer.

Recusa na validação local SHALL NOT gerar requisição ao backend.

#### Scenario: Campo obrigatório vazio
- **WHEN** a ação é acionada com um campo obrigatório vazio
- **THEN** o campo é marcado como inválido com a mensagem correspondente
- **AND** nenhuma requisição é enviada

#### Scenario: Senha curta demais
- **WHEN** a senha informada no cadastro é menor que o mínimo aceito
- **THEN** o campo da senha é marcado como inválido
- **AND** nenhuma requisição é enviada

#### Scenario: Backend recusa o que passou localmente
- **WHEN** os dados passam pela validação local e o backend os recusa
- **THEN** a recusa do backend é exibida na tela

### Requirement: Erros do backend atribuídos ao campo correspondente

Quando o backend recusa os dados apontando quais campos falharam, a tela SHALL
exibir cada motivo no campo a que ele se refere.

Erros que não pertencem a um campo específico — credenciais inválidas, e-mail
já cadastrado, falha de conexão — SHALL ser exibidos como mensagem geral do
formulário, anunciada a tecnologias assistivas sem exigir que o foco se mova
até ela.

#### Scenario: Recusa por campo
- **WHEN** o backend indica que o e-mail é inválido
- **THEN** a mensagem aparece no campo de e-mail

#### Scenario: Credenciais inválidas
- **WHEN** o backend recusa a entrada por credenciais inválidas
- **THEN** a mensagem aparece como erro geral do formulário
- **AND** é anunciada a tecnologias assistivas

#### Scenario: Backend inacessível
- **WHEN** o backend não responde
- **THEN** a tela informa que houve falha de conexão, e não que as credenciais
  estão erradas

### Requirement: Estado de envio em curso

Durante o envio, a tela SHALL indicar que a operação está em curso e SHALL
impedir novo envio do mesmo formulário até que o resultado chegue.

Isso evita cadastros duplicados e entradas concorrentes que disparariam
sessões extras no backend.

#### Scenario: Envio em curso
- **WHEN** o formulário está sendo enviado
- **THEN** a ação exibe estado de carregamento
- **AND** acioná-la de novo não dispara outra requisição

#### Scenario: Erro libera o formulário
- **WHEN** o envio termina em falha
- **THEN** a ação volta a estar disponível para nova tentativa

### Requirement: Formulários acessíveis por teclado e a leitores de tela

Cada campo SHALL ter rótulo programaticamente associado ao seu controle.

Os campos SHALL declarar seu propósito ao navegador, de modo que o
preenchimento automático e os gerenciadores de senha funcionem, e o campo de
senha SHALL NOT expor o texto digitado.

Os formulários SHALL poder ser enviados pelo teclado, sem exigir clique no
botão.

#### Scenario: Envio pelo teclado
- **WHEN** o usuário pressiona Enter com o foco em um campo do formulário
- **THEN** o formulário é enviado

#### Scenario: Propósito dos campos declarado
- **WHEN** as telas são exibidas
- **THEN** cada campo declara seu propósito para preenchimento automático
- **AND** o campo de senha oculta o texto digitado

#### Scenario: Erro alcançável por leitor de tela
- **WHEN** um campo é marcado como inválido
- **THEN** a mensagem de erro está associada ao campo, e não apenas próxima
  dele na tela
