## Purpose

Define o conjunto de componentes base reutilizáveis do mem-words — seus estados,
variantes e comportamento de acessibilidade — para que telas novas sejam
montadas a partir de peças consistentes em vez de reescreverem seus próprios
botões, campos e caixas.

## ADDED Requirements

### Requirement: Componentes consomem apenas tokens

Todo componente base SHALL obter cor, espaçamento, tipografia, raio, sombra e
duração de transição dos tokens do design system.

Nenhum componente SHALL conter valor visual literal. Essa é a garantia que
permite mudar a identidade visual do produto editando apenas os tokens.

#### Scenario: Troca de paleta sem tocar em componentes
- **WHEN** os valores dos tokens de cor são alterados
- **THEN** todos os componentes refletem a nova paleta
- **AND** nenhum arquivo de componente precisou ser editado

### Requirement: Botão

O sistema SHALL oferecer um componente de botão com as variantes **primária**
(ação principal da tela), **secundária** (ação alternativa), **ghost** (ação
de baixo peso visual) e **perigo** (ação destrutiva), em ao menos dois
tamanhos.

O botão SHALL suportar os estados normal, hover, foco, ativo, desabilitado e
carregando.

#### Scenario: Ação destrutiva é visualmente distinta
- **WHEN** um botão usa a variante de perigo
- **THEN** ele é visualmente distinguível das demais variantes
- **AND** a distinção não depende apenas de cor

#### Scenario: Botão carregando não dispara duas vezes
- **WHEN** um botão está no estado de carregando
- **THEN** ele não pode ser acionado novamente
- **AND** exibe um indicador de progresso
- **AND** comunica o estado de ocupado a tecnologias assistivas

#### Scenario: Botão desabilitado
- **WHEN** um botão está desabilitado
- **THEN** ele não pode ser acionado
- **AND** sua aparência indica a indisponibilidade

#### Scenario: Acionamento por teclado
- **WHEN** o botão tem o foco e o usuário aciona Enter ou Espaço
- **THEN** a ação do botão é executada

### Requirement: Campo de entrada

O sistema SHALL oferecer um componente de campo de texto composto por rótulo,
o controle de entrada, texto de ajuda opcional e mensagem de erro opcional.

O rótulo SHALL estar programaticamente associado ao controle, de modo que
acioná-lo mova o foco para o campo e que leitores de tela o anunciem.

#### Scenario: Rótulo associado ao controle
- **WHEN** o usuário aciona o rótulo de um campo
- **THEN** o foco vai para o controle de entrada correspondente

#### Scenario: Campo com erro
- **WHEN** um campo está em estado de erro
- **THEN** a mensagem de erro é exibida junto ao campo
- **AND** o campo é marcado como inválido para tecnologias assistivas
- **AND** a mensagem é associada ao campo, e não apenas posicionada perto dele

#### Scenario: Erro não depende só de cor
- **WHEN** um campo está em estado de erro
- **THEN** a condição é comunicada por texto, além da cor

#### Scenario: Texto de ajuda
- **WHEN** um campo tem texto de ajuda e não está em erro
- **THEN** a ajuda é exibida e associada ao campo

### Requirement: Cartão

O sistema SHALL oferecer um componente de cartão que agrupa conteúdo
relacionado sobre uma superfície delimitada, com título opcional.

#### Scenario: Cartão agrupa conteúdo
- **WHEN** um conteúdo é colocado dentro de um cartão
- **THEN** ele é exibido sobre uma superfície visualmente distinta do fundo da
  página

### Requirement: Selo de estado

O sistema SHALL oferecer um componente de selo compacto para rotular estado,
com as variantes neutra, sucesso, atenção, erro e informação.

#### Scenario: Estado legível sem depender de cor
- **WHEN** um selo comunica um estado
- **THEN** o texto do selo identifica o estado
- **AND** a cor reforça a informação em vez de ser o único portador dela

### Requirement: Alerta

O sistema SHALL oferecer um componente de alerta para mensagens de sucesso,
atenção, erro e informação, com título opcional.

Alertas que surgem em resposta a uma ação do usuário SHALL ser anunciados a
tecnologias assistivas sem exigir que o foco se mova até eles.

#### Scenario: Alerta resultante de uma ação é anunciado
- **WHEN** um alerta aparece em resposta a uma ação do usuário
- **THEN** seu conteúdo é anunciado por tecnologias assistivas

### Requirement: Indicador de carregamento

O sistema SHALL oferecer um indicador de carregamento para operações cuja
duração não é conhecida de antemão.

#### Scenario: Carregamento é percebido sem visão
- **WHEN** um indicador de carregamento é exibido
- **THEN** a condição de carregamento é comunicada a tecnologias assistivas
- **AND** a animação não é a única forma de perceber o estado

### Requirement: Barra de progresso

O sistema SHALL oferecer uma barra de progresso para operações de duração
determinada, expondo o valor atual, o mínimo e o máximo.

#### Scenario: Progresso é legível por tecnologia assistiva
- **WHEN** uma barra de progresso exibe um valor
- **THEN** o valor atual e os limites são expostos a tecnologias assistivas

#### Scenario: Valor fora dos limites
- **WHEN** um valor abaixo do mínimo ou acima do máximo é fornecido
- **THEN** a barra é exibida limitada ao intervalo válido, sem quebrar o layout

### Requirement: Foco visível por teclado

Todo componente interativo SHALL exibir um indicador de foco visível quando
alcançado por teclado.

O indicador NÃO SHALL ser suprimido sem substituto. Removê-lo torna a interface
inoperável para quem navega por teclado.

#### Scenario: Navegação por teclado é rastreável
- **WHEN** o usuário percorre a interface com Tab
- **THEN** o elemento focado exibe um indicador visível a cada passo

#### Scenario: Foco não aparece em clique de mouse
- **WHEN** o usuário aciona um componente com o mouse
- **THEN** o indicador de foco de teclado não é exibido desnecessariamente

### Requirement: Galeria de componentes

O sistema SHALL oferecer uma página de galeria que exibe a paleta de cores e
todos os componentes base em suas variantes e estados.

A galeria SHALL ser alcançável na aplicação em execução, servindo de referência
viva: um componente novo que não apareça nela é considerado incompleto.

#### Scenario: Galeria cobre os componentes
- **WHEN** a galeria é aberta
- **THEN** cada componente base é exibido em suas variantes e estados
- **AND** a paleta de tokens de cor é exibida

#### Scenario: Galeria acompanha os dois temas
- **WHEN** a galeria é exibida no tema claro ou no escuro
- **THEN** todos os exemplos permanecem legíveis no tema ativo

### Requirement: Tela de status do backend preserva comportamento

A tela de status do backend SHALL continuar a consultar o endpoint de saúde ao
carregar, exibir o resultado como sucesso ou falha com o detalhe
correspondente, informar a origem da URL configurada e permitir nova
verificação sob demanda.

Esta é a tela existente sendo reconstruída sobre o design system. O requisito
existe para fixar que a mudança é de implementação, não de comportamento.

#### Scenario: Verificação ao carregar
- **WHEN** a tela é aberta
- **THEN** a consulta de saúde é disparada automaticamente
- **AND** o resultado é exibido como sucesso ou falha

#### Scenario: Nova verificação sob demanda
- **WHEN** o usuário solicita nova verificação
- **THEN** a consulta é repetida sem recarregar a página
- **AND** o estado de carregamento é exibido durante a consulta

#### Scenario: Origem da configuração é exibida
- **WHEN** a tela é exibida
- **THEN** o endpoint consultado e a origem da URL são informados
