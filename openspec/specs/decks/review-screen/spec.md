# decks/review-screen Specification

## Purpose
Define a tela de sessão de revisão de um baralho — como a fila de cards
prontos é percorrida, o que cada nota faz, o que a prévia de intervalo
mostra antes de escolher, e o que a tela garante a quem navega por
teclado ou usa leitor de tela.

## Requirements

### Requirement: Telas construídas sobre o design system

A tela de sessão de revisão SHALL ser montada com os componentes base
existentes e obter cor, espaçamento e tipografia dos tokens do design
system.

Ela NÃO SHALL introduzir valor visual literal nem um botão ou campo
próprio quando o componente equivalente já existe.

#### Scenario: Componentes reaproveitados
- **WHEN** a tela de sessão de revisão é exibida
- **THEN** botões e mensagens usam os componentes base do design system

#### Scenario: Temas claro e escuro
- **WHEN** a tela é exibida em qualquer um dos dois temas
- **THEN** permanece legível, seguindo o tema ativo pelos tokens

### Requirement: Sessão percorre a fila de revisão do baralho

Ao abrir a tela, o sistema SHALL buscar a fila de revisão do baralho e
exibir um card por vez, na ordem em que a fila chegou.

#### Scenario: Baralho com cards prontos
- **WHEN** a tela é aberta para um baralho com cards prontos para revisão
- **THEN** o primeiro card da fila é exibido, mostrando a palavra

#### Scenario: Nenhum card pronto
- **WHEN** a tela é aberta para um baralho sem nenhum card pronto para
  revisão
- **THEN** a tela informa que não há nada para revisar agora, com um
  caminho de volta para o detalhe do baralho

### Requirement: Revelar antes de notar

A tela SHALL exibir inicialmente só a palavra do card, com uma ação para
revelar a tradução e os demais campos preenchidos (classe gramatical,
sinônimos, frase de exemplo, anotação pessoal).

As quatro ações de nota (`again`, `hard`, `good`, `easy`) SHALL NOT
aparecer antes de a tradução ser revelada.

#### Scenario: Antes de revelar
- **WHEN** um card é exibido e ainda não foi revelado
- **THEN** somente a palavra e a ação de revelar aparecem

#### Scenario: Depois de revelar
- **WHEN** a ação de revelar é acionada
- **THEN** a tradução e os demais campos preenchidos aparecem, e as
  quatro ações de nota passam a estar disponíveis

### Requirement: Prévia do intervalo de cada nota

Junto de cada uma das quatro ações de nota, a tela SHALL exibir a prévia
de quando o card voltaria a aparecer caso aquela nota fosse escolhida, sem
exigir uma requisição por nota — a prévia SHALL vir da mesma busca que
trouxe o card para a fila.

#### Scenario: Prévias visíveis ao revelar
- **WHEN** a tradução de um card é revelada
- **THEN** cada uma das quatro ações de nota mostra havia quanto tempo (em
  minutos ou dias) o card voltará a aparecer, sem nova requisição ao
  backend

### Requirement: Registrar uma nota avança para o próximo card

Ao escolher uma nota, o sistema SHALL registrá-la e, tendo sucesso, exibir
o próximo card da fila; SHALL NOT buscar a fila de novo a cada nota.

Não havendo próximo card, a tela SHALL exibir que a sessão terminou, com
um caminho de volta para o detalhe do baralho.

#### Scenario: Nota registrada, ainda há cards
- **WHEN** uma nota é escolhida para um card que não é o último da fila
- **THEN** a nota é registrada e o próximo card da fila é exibido, sem
  tradução revelada

#### Scenario: Nota registrada no último card
- **WHEN** uma nota é escolhida para o último card da fila
- **THEN** a nota é registrada e a tela informa que a sessão terminou

#### Scenario: Falha ao registrar a nota
- **WHEN** o registro de uma nota falha
- **THEN** o card atual continua exibido, com a recusa comunicada, e as
  ações de nota continuam disponíveis para nova tentativa

### Requirement: Estado de envio em curso

Ao registrar uma nota, a tela SHALL indicar que a operação está em curso e
SHALL impedir novo registro para o mesmo card até que o resultado chegue.

#### Scenario: Envio em curso
- **WHEN** uma nota está sendo registrada
- **THEN** a ação escolhida exibe estado de carregamento
- **AND** escolher outra nota para o mesmo card não dispara outra
  requisição

### Requirement: Ações acessíveis por teclado e a leitores de tela

A ação de revelar e as quatro ações de nota SHALL ser alcançáveis e
acionáveis por teclado, como qualquer botão da aplicação.

A troca de card SHALL ser percebida por tecnologia assistiva, não apenas
visualmente.

#### Scenario: Navegação e acionamento por teclado
- **WHEN** o foco está em uma dessas ações e o usuário aciona Enter ou
  Espaço
- **THEN** a ação é executada

#### Scenario: Troca de card anunciada
- **WHEN** o card exibido muda — por revelar, por avançar, ou por
  terminar a sessão
- **THEN** a mudança é anunciada a tecnologias assistivas

### Requirement: Caminho de volta sempre alcançável

A tela de sessão de revisão SHALL oferecer uma ação para voltar ao detalhe
do baralho, alcançável em qualquer estado da tela — carregando a fila,
revisando um card, fila vazia, sessão concluída ou erro.

#### Scenario: Ação visível durante a revisão

- **WHEN** a tela está exibindo um card para revisão
- **THEN** uma ação para voltar ao detalhe do baralho está visível e
  alcançável, sem precisar terminar ou interromper a sessão
