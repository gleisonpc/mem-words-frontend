## ADDED Requirements

### Requirement: Saudação e sequência de dias

A tela inicial SHALL abrir com uma saudação que inclui o primeiro nome do
usuário autenticado e varia conforme o período do dia (manhã, tarde,
noite).

Quando o usuário tiver ao menos um dia de sequência ativa
(`currentStreak` maior que zero), a tela SHALL exibir um selo com quantos
dias seguidos ele revisou algo. Sem sequência ativa, o selo SHALL NOT
aparecer.

#### Scenario: Saudação com o nome do usuário
- **WHEN** a tela inicial é exibida
- **THEN** a saudação inclui o primeiro nome do usuário autenticado

#### Scenario: Selo de sequência ativa
- **WHEN** o usuário autenticado tem `currentStreak` maior que zero
- **THEN** um selo indica quantos dias seguidos ele revisou algo

#### Scenario: Sem sequência ativa
- **WHEN** o usuário autenticado tem `currentStreak` igual a zero (nunca
  revisou, ou a sequência foi interrompida)
- **THEN** nenhum selo de sequência aparece

### Requirement: Resumo de revisão do dia

A tela inicial SHALL exibir um resumo dos cards prontos para revisão
agora, agregado entre todos os baralhos do usuário: o total, dividido em
três contagens (novos, aprendendo, revisão), e um tempo estimado para a
sessão.

A tela SHALL oferecer, a partir desse resumo, a ação de começar uma
revisão e a ação de adicionar uma palavra.

#### Scenario: Resumo com cards prontos
- **WHEN** a tela inicial é exibida e há ao menos um card pronto para
  revisão em algum baralho do usuário
- **THEN** o resumo mostra o total de cards prontos, as três contagens
  (novos/aprendendo/revisão) e um tempo estimado para a sessão

#### Scenario: Nenhum card pronto
- **WHEN** a tela inicial é exibida e não há nenhum card pronto para
  revisão em nenhum baralho do usuário
- **THEN** o resumo informa que não há nada para revisar agora, em vez de
  contagens zeradas sem explicação
- **AND** a ação de começar uma revisão fica indisponível

#### Scenario: Começar revisão a partir do resumo
- **WHEN** a ação de começar uma revisão é acionada e há ao menos um
  baralho com cards prontos
- **THEN** o usuário é levado à tela de sessão de revisão do baralho mais
  antigo, entre os que têm cards prontos

#### Scenario: Adicionar palavra com um único baralho
- **WHEN** a ação de adicionar uma palavra é acionada e o usuário tem
  exatamente um baralho
- **THEN** o usuário é levado direto à tela de detalhe desse baralho

#### Scenario: Adicionar palavra com mais de um baralho
- **WHEN** a ação de adicionar uma palavra é acionada e o usuário tem mais
  de um baralho
- **THEN** a tela oferece uma escolha entre os baralhos existentes antes
  de navegar

#### Scenario: Ações de revisão de hoje indisponíveis sem baralho algum
- **WHEN** a tela inicial é exibida para um usuário sem nenhum baralho
- **THEN** o resumo de revisão do dia não aparece, apenas o convite para
  criar o primeiro baralho

#### Scenario: Resumo indisponível
- **WHEN** o resumo de revisão do dia não pode ser carregado
- **THEN** a tela informa a falha nesse resumo, sem impedir o restante da
  tela inicial (saudação e lista de baralhos) de funcionar

## MODIFIED Requirements

### Requirement: Lista dos próprios baralhos

A área autenticada SHALL ter uma tela inicial que lista, sob o título
"Meus baralhos", os baralhos do usuário autenticado, e SHALL oferecer a
ação de criar um novo baralho a partir dela.

Cada baralho na lista SHALL indicar seu par de idiomas, o total de cards e
quantos estão prontos para revisão agora.

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

#### Scenario: Usuário sem baralhos

- **WHEN** a tela inicial é exibida para um usuário sem nenhum baralho
- **THEN** a tela informa que não há baralhos ainda, em vez de uma lista
  vazia sem explicação

#### Scenario: Abrir um baralho

- **WHEN** um baralho da lista é selecionado
- **THEN** o usuário é levado à tela de detalhe daquele baralho

#### Scenario: Progresso de maturidade

- **WHEN** a tela inicial é exibida
- **THEN** nenhuma linha da lista mostra a fração de cards maduros — essa
  informação passa a existir apenas na tela de detalhe do baralho
