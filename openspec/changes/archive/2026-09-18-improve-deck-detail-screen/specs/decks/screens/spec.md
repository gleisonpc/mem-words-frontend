## MODIFIED Requirements

### Requirement: Detalhe de um baralho

Cada baralho SHALL ter uma tela de detalhe própria, endereçável por URL, que
exibe o nome do baralho, o par de idiomas e a lista paginada de seus cards.

A tela SHALL oferecer a ação de iniciar uma revisão do baralho, indicando
quantos cards estão prontos para revisão agora.

A tela SHALL exibir, em blocos separados e visíveis assim que o baralho
carrega, quantos de seus cards estão em cada um dos quatro status que o
backend conta: novos, aprendendo, maduros e suspensos.

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

#### Scenario: Blocos de contagem por status
- **WHEN** a tela de detalhe de um baralho é exibida
- **THEN** quatro blocos mostram, respectivamente, quantos cards estão
  novos, aprendendo, maduros e suspensos

#### Scenario: Baralho recém-criado, sem cards
- **WHEN** a tela de detalhe de um baralho sem nenhum card é exibida
- **THEN** os quatro blocos de contagem aparecem todos com `0`, e não
  ocultos

## ADDED Requirements

### Requirement: Busca e filtro de cards por status

A lista de cards da tela de detalhe SHALL oferecer um campo de busca por
palavra e um filtro por status (todos, novo, aprendendo, difícil,
maduro, em revisão, suspenso), aplicados sobre o conjunto inteiro de
cards do baralho — não só a página já carregada.

Buscar ou filtrar SHALL reiniciar a lista na primeira página, e a
paginação exibida SHALL refletir o total já filtrado.

#### Scenario: Buscar por palavra
- **WHEN** um texto é digitado no campo de busca
- **THEN** a lista passa a mostrar só os cards cuja palavra contém esse
  texto, e a paginação reflete esse total

#### Scenario: Filtrar por status
- **WHEN** um status é selecionado no filtro
- **THEN** a lista passa a mostrar só os cards com aquele status

#### Scenario: Busca e filtro combinados
- **WHEN** um texto de busca e um status estão ativos ao mesmo tempo
- **THEN** a lista mostra só os cards que casam com os dois critérios

#### Scenario: Nenhum resultado
- **WHEN** a busca ou o filtro não casam com nenhum card do baralho
- **THEN** a tela informa que nenhum card foi encontrado, em vez de uma
  lista vazia sem explicação

#### Scenario: Limpar busca e filtro
- **WHEN** a busca é limpa e o filtro volta a "todos"
- **THEN** a lista volta a mostrar todos os cards do baralho, paginados
  como antes

### Requirement: Selo de status de um card

Cada card listado SHALL exibir um selo com seu status — novo, aprendendo,
difícil, maduro, em revisão ou suspenso — e, quando o card já tiver uma
próxima revisão agendada (`dueAt`), a data dessa próxima revisão.

Um card sem `dueAt` (nunca revisado, ou suspenso) SHALL indicar a
ausência de próxima revisão, em vez de uma data vazia ou incorreta.

#### Scenario: Cada status tem um selo distinguível
- **WHEN** a lista de cards é exibida
- **THEN** cada card mostra o selo correspondente ao seu status, e o
  texto do selo por si só identifica o status, sem depender só da cor

#### Scenario: Próxima revisão de um card agendado
- **WHEN** um card tem `dueAt` no futuro ou já vencido
- **THEN** a tela mostra a data (ou "hoje", quando já venceu) dessa
  próxima revisão

#### Scenario: Card sem próxima revisão
- **WHEN** um card nunca foi revisado, ou está suspenso
- **THEN** a tela indica que não há próxima revisão agendada, em vez de
  uma data vazia

### Requirement: Suspensão e reativação de um card

Cada card listado SHALL oferecer a ação de suspendê-lo ou reativá-lo,
conforme seu status atual — suspender tira o card da revisão até o
usuário decidir reativá-lo, e a escolha de quando é sempre do usuário,
nunca automática.

Suspender ou reativar um card SHALL atualizar seu selo de status
imediatamente, sem exigir recarregar a página.

#### Scenario: Suspender um card ativo
- **WHEN** a ação de suspender é acionada em um card que não está
  suspenso
- **THEN** o card passa a mostrar o selo "suspenso"

#### Scenario: Reativar um card suspenso
- **WHEN** a ação de reativar é acionada em um card suspenso
- **THEN** o card volta a mostrar o selo do status que tinha antes de
  ser suspenso

#### Scenario: Falha ao suspender ou reativar
- **WHEN** a requisição de suspender ou reativar falha
- **THEN** a tela exibe a falha, e o selo do card continua refletindo seu
  status anterior, sem mudança otimista desfeita silenciosamente
