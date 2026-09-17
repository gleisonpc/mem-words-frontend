## ADDED Requirements

### Requirement: Caminho para a tela inicial alcançável de qualquer tela protegida

A área autenticada SHALL oferecer, de qualquer tela protegida, um caminho
visível de volta para a tela inicial (a lista de baralhos) — não apenas por
meio do botão voltar do navegador.

#### Scenario: Marca como caminho de volta

- **WHEN** uma tela protegida é exibida
- **THEN** a marca da aplicação no cabeçalho é um link para a tela inicial

#### Scenario: Acionar o caminho de volta

- **WHEN** esse caminho é acionado a partir de qualquer tela protegida
- **THEN** o usuário é levado à tela inicial da área autenticada
