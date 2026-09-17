## MODIFIED Requirements

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
