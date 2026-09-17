## MODIFIED Requirements

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
