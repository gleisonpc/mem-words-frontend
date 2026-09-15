# design-system/tokens Specification

## Purpose

Define o vocabulário visual compartilhado do mem-words — cor, tipografia,
espaçamento, raio, sombra e transição — como um conjunto de tokens nomeados por
papel semântico, de modo que a aparência do produto seja alterável em um único
lugar e permaneça consistente entre temas.

## Requirements

### Requirement: Tokens nomeados por papel semântico

O sistema SHALL expor os tokens de cor por papel semântico (a função que a cor
cumpre na interface), não por aparência literal.

Um token SHALL ser nomeado pelo que ele significa — superfície, texto, borda,
ação primária, estado de perigo — e NÃO pela cor que carrega. Nomes como
`--azul-500` ou `--cinza-claro` são proibidos porque amarram o nome a um valor
que muda entre temas.

#### Scenario: Token nomeado pela função
- **WHEN** um token representa a cor de fundo de um cartão
- **THEN** seu nome descreve o papel (superfície), não o valor (branco)
- **AND** o mesmo nome permanece correto no tema escuro, onde o valor é escuro

#### Scenario: Interface não referencia cor literal
- **WHEN** qualquer componente da interface precisa de uma cor
- **THEN** ele referencia um token
- **AND** nenhum valor de cor literal aparece fora da definição dos tokens

### Requirement: Temas claro e escuro sobre os mesmos nomes

O sistema SHALL oferecer tema claro e tema escuro, seguindo a preferência
declarada pelo sistema operacional do usuário.

Ambos os temas SHALL definir exatamente o mesmo conjunto de nomes de token,
variando apenas os valores. Nenhum token pode existir em um tema e faltar no
outro.

#### Scenario: Preferência do sistema é respeitada
- **WHEN** o usuário tem preferência por tema escuro no sistema operacional
- **THEN** a interface é exibida com os valores do tema escuro

#### Scenario: Componente não conhece o tema ativo
- **WHEN** um componente é exibido em qualquer um dos temas
- **THEN** ele produz a aparência correta sem ramificar por tema
- **AND** nenhuma lógica condicional de tema existe no componente

#### Scenario: Conjuntos de tokens são simétricos
- **WHEN** um token é definido em um dos temas
- **THEN** o mesmo nome está definido no outro tema

### Requirement: Contraste acessível

Toda combinação de texto sobre fundo oferecida pelos tokens SHALL atingir, no
mínimo, a razão de contraste 4.5:1 exigida pela WCAG 2.1 nível AA para texto
normal, em ambos os temas.

Elementos não textuais que transmitem informação — bordas de campo, indicadores
de estado, anel de foco — SHALL atingir no mínimo 3:1 contra o fundo adjacente.

#### Scenario: Texto sobre superfície
- **WHEN** um texto usa o token de cor de texto sobre o token de superfície
- **THEN** o contraste entre os dois é de ao menos 4.5:1
- **AND** isso vale tanto no tema claro quanto no escuro

#### Scenario: Texto de estado sobre fundo de estado
- **WHEN** um texto de sucesso, erro ou atenção é exibido sobre o fundo do
  mesmo estado
- **THEN** o contraste entre os dois é de ao menos 4.5:1

#### Scenario: Indicador não textual
- **WHEN** uma borda de campo ou um anel de foco é exibido
- **THEN** seu contraste contra o fundo adjacente é de ao menos 3:1

### Requirement: Escalas para dimensões não cromáticas

O sistema SHALL expor escalas discretas e nomeadas para espaçamento, tamanho de
fonte, peso de fonte, raio de borda, sombra e duração de transição.

Valores fora dessas escalas NÃO SHALL ser usados pela interface. A escala existe
para tornar o ritmo visual previsível; permitir valores arbitrários a anula.

#### Scenario: Espaçamento vem da escala
- **WHEN** um componente precisa de espaçamento interno ou externo
- **THEN** o valor usado é um degrau da escala de espaçamento

#### Scenario: Escala de espaçamento é proporcional
- **WHEN** os degraus da escala de espaçamento são comparados
- **THEN** eles seguem uma progressão regular a partir de uma unidade base
- **AND** a progressão permite compor espaçamentos sem valores intermediários
  arbitrários

### Requirement: Movimento respeita preferência de redução

Animações e transições SHALL ser suprimidas quando o usuário declarar
preferência por redução de movimento no sistema operacional.

#### Scenario: Usuário pediu menos movimento
- **WHEN** o usuário tem preferência por movimento reduzido
- **THEN** transições e animações da interface são desativadas ou reduzidas a
  uma duração imperceptível
- **AND** nenhuma informação é perdida pela ausência da animação
