## ADDED Requirements

### Requirement: Grades de colunas fixas colapsam em telas de celular

Toda grade de layout que dispõe um conjunto fixo de ações ou de campos de
formulário em colunas fixas (largura independente do conteúdo) SHALL
colapsar para um número menor de colunas abaixo do breakpoint mobile do
design system, de modo que cada coluna restante mantenha espaço suficiente
para seu texto e para um alvo de toque utilizável.

Essa mudança SHALL ser só de layout: nenhuma ação, campo ou informação
SHALL deixar de aparecer, e a ordem de leitura SHALL permanecer a mesma,
abaixo ou acima do breakpoint.

#### Scenario: Grade de ações colapsa abaixo do breakpoint mobile
- **WHEN** uma grade de ações de largura fixa é exibida em uma tela mais
  estreita que o breakpoint mobile
- **THEN** o número de colunas é reduzido o suficiente para que cada ação
  continue legível e com alvo de toque utilizável
- **AND** todas as ações continuam presentes, na mesma ordem

#### Scenario: Grade de formulário colapsa abaixo do breakpoint mobile
- **WHEN** um par de campos de formulário lado a lado é exibido em uma tela
  mais estreita que o breakpoint mobile
- **THEN** os campos passam a ocupar a largura cheia, empilhados em vez de
  lado a lado
- **AND** o rótulo, o valor e a mensagem de erro de cada campo continuam
  associados corretamente

#### Scenario: Layout de colunas fixas é preservado acima do breakpoint
- **WHEN** a mesma grade é exibida em uma tela mais larga que o breakpoint
  mobile
- **THEN** o layout de colunas fixas atual é mantido sem alteração
