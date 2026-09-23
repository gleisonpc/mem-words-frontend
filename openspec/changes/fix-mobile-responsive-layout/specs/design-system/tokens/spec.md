## ADDED Requirements

### Requirement: Breakpoint mobile nomeado

O sistema SHALL expor um token de breakpoint mobile, nomeado pelo papel
("largura abaixo da qual o layout é de celular"), não pelo valor em pixels.

Layout responsivo SHALL consultar esse token em vez de repetir o valor de
largura em cada componente — um único lugar decide a partir de qual largura
a interface passa a se comportar como celular.

#### Scenario: Token consultado em vez de valor repetido
- **WHEN** um componente precisa mudar de layout abaixo da largura de
  celular
- **THEN** ele consulta o token de breakpoint mobile
- **AND** nenhum valor de largura em pixels equivalente aparece hardcoded
  fora da definição do token

#### Scenario: Um único lugar redefine o limite
- **WHEN** a largura que define "celular" precisa mudar
- **THEN** a mudança é feita apenas na definição do token
- **AND** todo componente que consulta o token passa a usar o novo limite
