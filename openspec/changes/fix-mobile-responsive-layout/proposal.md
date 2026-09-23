## Why

O app não define nenhum breakpoint responsivo — o único `@media` em
`tokens.css` é para tema escuro e movimento reduzido. Duas telas usam grade
CSS de colunas fixas independente da largura da tela: os quatro botões de
nota da revisão (`.review-session__grades`, `grid-template-columns:
repeat(4, 1fr)`) e o par Palavra/Tradução do formulário de card
(`.add-card-form__grid`, `grid-template-columns: 1fr 1fr`). Em um celular
estreito (~360px, menos os `space-6` de padding do `Card` dos dois lados),
cada uma das quatro colunas de nota sobra com ~65px — insuficiente para o
rótulo mais a prévia de intervalo (ex. "Difícil" + "em 10 min") sem quebrar
de forma ilegível e com alvo de toque pequeno demais. A tela de revisão é o
fluxo central do app (repetição espaçada), o que torna esse problema
particularmente visível no celular.

## What Changes

- Adicionar ao design system um token de breakpoint mobile e a convenção de
  quando uma grade de colunas fixas deve colapsar abaixo dele.
- `.review-session__grades`: abaixo do breakpoint mobile, colapsar de 4
  colunas para 2 colunas (mantendo os textos legíveis e o alvo de toque
  adequado); acima do breakpoint, manter as 4 colunas atuais.
- `.add-card-form__grid`: abaixo do breakpoint mobile, colapsar o par
  Palavra/Tradução de 2 colunas para 1 coluna (empilhado); acima do
  breakpoint, manter as 2 colunas atuais.
- Nenhuma mudança de comportamento — só de layout. Os componentes
  continuam os mesmos, mesmas ações, mesmos textos.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `design-system/tokens`: novo requisito de breakpoint(s) nomeado(s) para
  layout responsivo.
- `design-system/components`: novo requisito de que grades de colunas
  fixas usadas por telas do produto colapsem para menos colunas abaixo do
  breakpoint mobile, sem perder informação nem alvo de toque adequado.

## Impact

- `src/styles/tokens.css`: novo token de breakpoint.
- `src/pages/ReviewSessionPage.css`: `@media` abaixo do breakpoint mobile
  para `.review-session__grades`.
- `src/pages/AddCardPage.css`: `@media` abaixo do breakpoint mobile para
  `.add-card-form__grid`.
- Nenhuma mudança de API, dependência ou comportamento funcional.
