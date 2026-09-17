# decks/screens Specification

## Purpose
Define as telas de baralhos e cards — a lista de baralhos do usuário e o
detalhe de um baralho com seus cards — que campos existem, o que é validado
antes de incomodar o backend, como cada tipo de recusa é comunicada e o que
cada tela garante a quem navega por teclado ou usa leitor de tela.

## Requirements

### Requirement: Telas construídas sobre o design system

As telas de baralhos e cards SHALL ser montadas com os componentes base
existentes e obter cor, espaçamento e tipografia dos tokens do design
system.

Nenhuma delas SHALL introduzir valor visual literal nem um botão ou campo
próprio quando o componente equivalente já existe.

#### Scenario: Componentes reaproveitados
- **WHEN** as telas de baralhos e cards são exibidas
- **THEN** campos, botões e mensagens usam os componentes base do design
  system

#### Scenario: Temas claro e escuro
- **WHEN** as telas são exibidas em qualquer um dos dois temas
- **THEN** permanecem legíveis, seguindo o tema ativo pelos tokens

### Requirement: Lista dos próprios baralhos

A área autenticada SHALL ter uma tela inicial que lista os baralhos do
usuário autenticado, e SHALL oferecer a ação de criar um novo baralho a
partir dela.

Cada baralho na lista SHALL indicar quantos de seus cards estão prontos
para revisão agora, e a fração de seus cards já maduros.

#### Scenario: Usuário com baralhos

- **WHEN** a tela inicial é exibida para um usuário com baralhos
- **THEN** cada baralho aparece com seu nome, o par de idiomas e o total
  de cards

#### Scenario: Selo de prontos para revisão

- **WHEN** um baralho tem ao menos um card pronto para revisão agora
- **THEN** ele aparece com um selo indicando quantos estão prontos

#### Scenario: Selo de baralho em dia

- **WHEN** um baralho não tem nenhum card pronto para revisão agora
- **THEN** ele aparece com um selo indicando que está em dia, em vez do
  selo de contagem

#### Scenario: Progresso de maturidade

- **WHEN** um baralho tem ao menos um card
- **THEN** a tela exibe a fração de cards já maduros, com uma barra de
  progresso e o valor em porcentagem

#### Scenario: Usuário sem baralhos

- **WHEN** a tela inicial é exibida para um usuário sem nenhum baralho
- **THEN** a tela informa que não há baralhos ainda, em vez de uma lista
  vazia sem explicação

#### Scenario: Abrir um baralho

- **WHEN** um baralho da lista é selecionado
- **THEN** o usuário é levado à tela de detalhe daquele baralho

### Requirement: Criação de baralho

A tela inicial SHALL oferecer um formulário para criar um baralho, com os
campos de nome, idioma de origem e idioma de destino, todos obrigatórios.

O formulário SHALL ficar oculto até ser acionado explicitamente, e NÃO
SHALL permanecer sempre visível na tela.

Criado o baralho, ele SHALL aparecer na lista sem exigir recarregar a
página.

#### Scenario: Criação bem-sucedida

- **WHEN** os dados informados são aceitos
- **THEN** o baralho é criado e passa a aparecer na lista

#### Scenario: Nome vazio

- **WHEN** a criação é acionada com o nome vazio
- **THEN** o campo é marcado como inválido e nenhuma requisição é enviada

#### Scenario: Revelar o formulário

- **WHEN** a ação de criar um baralho é acionada
- **THEN** o formulário aparece, pronto para preencher

#### Scenario: Cancelar a criação

- **WHEN** o formulário é cancelado antes de enviar
- **THEN** ele volta a ficar oculto, sem nenhuma requisição enviada

### Requirement: Detalhe de um baralho

Cada baralho SHALL ter uma tela de detalhe própria, endereçável por URL, que
exibe o nome do baralho, o par de idiomas e a lista paginada de seus cards.

A tela SHALL oferecer a ação de iniciar uma revisão do baralho, indicando
quantos cards estão prontos para revisão agora.

#### Scenario: Baralho com cards
- **WHEN** a tela de detalhe de um baralho com cards é exibida
- **THEN** os cards aparecem com palavra e tradução

#### Scenario: Baralho sem cards
- **WHEN** a tela de detalhe de um baralho sem nenhum card é exibida
- **THEN** a tela informa que não há cards ainda, em vez de uma lista vazia
  sem explicação

#### Scenario: Navegação entre páginas de cards
- **WHEN** o baralho tem mais cards do que cabem em uma página
- **THEN** a tela oferece uma ação para ver as próximas/anteriores, e o
  conjunto exibido muda de acordo

#### Scenario: Ação de revisar mostra quantos cards estão prontos
- **WHEN** a tela de detalhe de um baralho é exibida
- **THEN** a ação de iniciar uma revisão mostra quantos cards do baralho
  estão prontos para revisão agora

#### Scenario: Iniciar uma revisão
- **WHEN** a ação de iniciar uma revisão é acionada
- **THEN** o usuário é levado à tela de sessão de revisão daquele baralho

### Requirement: Edição e exclusão de um baralho

A tela de detalhe SHALL oferecer as ações de editar o nome e o par de
idiomas do baralho, e de excluí-lo.

Excluir um baralho SHALL pedir confirmação antes de prosseguir, porque a
ação remove também todos os seus cards, e não pode ser desfeita.

Concluída a exclusão, o usuário SHALL ser levado de volta à lista de
baralhos.

#### Scenario: Edição bem-sucedida
- **WHEN** um novo nome é aceito pelo backend
- **THEN** a tela passa a exibir o nome atualizado

#### Scenario: Exclusão confirmada
- **WHEN** a exclusão de um baralho é confirmada
- **THEN** o baralho e seus cards deixam de existir, e o usuário volta à
  lista de baralhos

#### Scenario: Exclusão cancelada
- **WHEN** a confirmação de exclusão é recusada
- **THEN** o baralho não é excluído e a tela de detalhe continua exibida

### Requirement: Criação de card em um baralho

A tela de detalhe de um baralho SHALL oferecer um formulário para criar um
card, com os campos obrigatórios de palavra e tradução, e os campos
opcionais de classe gramatical, sinônimos, frase de exemplo, tradução da
frase e anotação pessoal.

Criado o card, ele SHALL aparecer na lista sem exigir recarregar a página.

#### Scenario: Criação com campos obrigatórios
- **WHEN** palavra e tradução são informadas e aceitas
- **THEN** o card é criado e passa a aparecer na lista do baralho

#### Scenario: Palavra ou tradução vazia
- **WHEN** a criação é acionada sem palavra ou sem tradução
- **THEN** o campo correspondente é marcado como inválido e nenhuma
  requisição é enviada

### Requirement: Edição e exclusão de um card

Cada card listado SHALL oferecer as ações de editar seus campos e de
excluí-lo.

Excluir um card SHALL pedir confirmação antes de prosseguir, porque a ação
não pode ser desfeita.

#### Scenario: Edição bem-sucedida
- **WHEN** os novos dados de um card são aceitos pelo backend
- **THEN** a tela passa a exibir os dados atualizados

#### Scenario: Exclusão confirmada
- **WHEN** a exclusão de um card é confirmada
- **THEN** o card deixa de aparecer na lista

#### Scenario: Exclusão cancelada
- **WHEN** a confirmação de exclusão é recusada
- **THEN** o card não é excluído

### Requirement: Validação no cliente espelhando as regras do backend

Antes de enviar, os formulários de baralho e de card SHALL validar os
campos obrigatórios com as mesmas regras que o backend aplica — presença e
limites de tamanho.

A validação no cliente SHALL servir para dar resposta imediata, e NÃO SHALL
ser tratada como a garantia: a recusa do backend continua sendo a palavra
final e SHALL ser exibida quando ocorrer.

Recusa na validação local SHALL NOT gerar requisição ao backend.

#### Scenario: Backend recusa o que passou localmente
- **WHEN** os dados passam pela validação local e o backend os recusa
- **THEN** a recusa do backend é exibida na tela, atribuída ao campo
  correspondente quando o backend indicar qual campo falhou

### Requirement: Baralho ou card de outra conta, ou já excluído

Ao abrir a tela de detalhe de um baralho, ou ao agir sobre um card, que não
existe mais ou pertence a outra conta, a tela SHALL informar que o recurso
não está disponível, em vez de exibir uma tela quebrada ou vazia sem
explicação.

#### Scenario: Baralho de outra conta ou inexistente
- **WHEN** a tela de detalhe é aberta para um baralho que não existe ou não
  pertence ao usuário autenticado
- **THEN** a tela informa que o baralho não está disponível, com um caminho
  de volta para a lista de baralhos

### Requirement: Estado de envio em curso

Durante o envio de qualquer formulário de baralho ou de card, a tela SHALL
indicar que a operação está em curso e SHALL impedir novo envio do mesmo
formulário até que o resultado chegue.

#### Scenario: Envio em curso
- **WHEN** um formulário de baralho ou de card está sendo enviado
- **THEN** a ação exibe estado de carregamento
- **AND** acioná-la de novo não dispara outra requisição

#### Scenario: Erro libera o formulário
- **WHEN** o envio termina em falha
- **THEN** a ação volta a estar disponível para nova tentativa

### Requirement: Formulários acessíveis por teclado e a leitores de tela

Cada campo dos formulários de baralho e de card SHALL ter rótulo
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

### Requirement: Caminho de volta sempre visível na tela de detalhe

A tela de detalhe de um baralho SHALL oferecer um link de volta para a
lista de baralhos, visível em qualquer estado da tela — carregando,
exibindo o baralho normalmente, ou indisponível — e não apenas quando o
baralho está indisponível.

#### Scenario: Link visível durante o uso normal

- **WHEN** a tela de detalhe de um baralho é exibida normalmente
- **THEN** um link de volta para a lista de baralhos está visível
