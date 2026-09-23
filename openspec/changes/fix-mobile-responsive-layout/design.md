## Context

Ver `proposal.md` para a motivação. O projeto não usa pré-processador nem
biblioteca de CSS — só custom properties em `src/styles/tokens.css`,
consumidas por CSS puro em cada componente/página. Não há nenhum breakpoint
hoje; os únicos `@media` existentes são `prefers-color-scheme` e
`prefers-reduced-motion` (`tokens.css`). Como custom properties CSS não
podem ser referenciadas dentro da condição de um `@media` (`@media
(max-width: var(--x))` não é válido em CSS), o token de breakpoint não pode
ser um valor central consultado dentro da media query em si — só pode ser
central como constante documentada e repetida nas media queries que a
usam.

## Goals / Non-Goals

**Goals:**
- Definir um breakpoint mobile único e nomeado, documentado em
  `tokens.css`, que todo `@media` de layout responsivo do projeto deve
  usar com o mesmo valor.
- Corrigir os dois pontos de grade fixa identificados na proposta
  (`.review-session__grades` e `.add-card-form__grid`) para colapsar
  abaixo desse breakpoint.

**Non-Goals:**
- Não é uma revisão geral de responsividade do app inteiro — outras telas
  já usam `flex-wrap` e larguras fluidas e não apresentam o mesmo problema
  (confirmado por inspeção: `AuthenticatedLayout.css`, `HomePage.css`,
  `DeckDetailPage.css`, `ProfilePage.css` já colapsam sozinhas em telas
  estreitas).
- Não introduz um sistema de grid responsivo genérico nem múltiplos
  breakpoints (tablet, desktop grande etc.) — só o limite mobile/não-mobile
  que os dois casos concretos precisam.
- Não muda o comportamento das telas (SRS, criação de card) — só o
  layout visual abaixo do breakpoint.

## Decisions

**Valor do breakpoint: `480px`.**
Alternativas consideradas: `768px` (breakpoint "tablet" comum em vários
design systems) e `600px`. `480px` foi escolhido porque os dois problemas
concretos são de largura de conteúdo dentro do `Card` (`padding:
var(--space-6)` = 24px de cada lado) somada ao `.shell__content` (`padding:
var(--space-4)` = 16px de cada lado): em qualquer celular físico comum
(360–430px de largura), a área útil já fica abaixo de ~380px, então
qualquer valor entre ~420px e ~600px cobre o caso real. `480px` é o valor
convencional mais próximo (usado por vários design systems como corte
"telefone vs. o resto") e evita colapsar cedo demais em tablets pequenos
em modo retrato, que não têm o mesmo aperto.

**Formato do token: comentário-constante em `tokens.css`, não uma custom
property usada dentro do `@media`.**
CSS não permite `var()` na condição de uma media query, então uma
`--breakpoint-mobile: 480px` não pode ser lida por `@media (max-width:
var(--breakpoint-mobile))`. A alternativa real disponível sem build tool
novo (sem Sass, sem PostCSS custom media) é documentar o valor uma vez, em
um comentário central em `tokens.css`, e repetir o literal `480px` em cada
`@media (max-width: 480px)` que o consome — igual ao padrão que o projeto
já usa para cor (tokens semânticos) mas com a ressalva explícita, no
comentário, de que motores de busca de texto (grep) por `480px` são a forma
de auditar onde o breakpoint é usado, já que não há indireção de
`var()` possível.
Alternativa descartada: introduzir PostCSS custom media
(`@custom-media --mobile (max-width: 480px)`) — mudaria a cadeia de build
(`vite.config.js`) por causa de dois seletores, desproporcional ao escopo
desta mudança.

**Grade de notas: 4 colunas → 2 colunas (não 1).**
Abaixo de `480px`, `.review-session__grades` passa a
`grid-template-columns: repeat(2, 1fr)`, formando um 2×2 em vez de uma
linha de 4. Empilhar em 1 coluna (4 linhas) foi descartado: aumentaria a
distância de rolagem/alcance do polegar entre "Errei" (pior nota) e
"Fácil" (melhor nota) sem necessidade — 2×2 já dá largura suficiente por
botão (metade da largura do card menos o gap, ainda com espaço para rótulo
e prévia) sem alongar a tela.

**Grade do formulário: 2 colunas → 1 coluna.**
`.add-card-form__grid` abaixo de `480px` vira `grid-template-columns: 1fr`
— os campos Palavra e Tradução empilham, como os demais campos do
formulário (que já são `ms-field--full`, ocupando a linha inteira). Não há
motivo para manter 2 colunas em um espaço tão estreito: ao contrário da
grade de notas, aqui não há uma relação espacial (pior→melhor) que se
beneficie de ficar lado a lado.

## Risks / Trade-offs

- [Repetir o literal `480px` em cada `@media` em vez de uma fonte única de
  verdade em CSS] → Mitigado documentando o valor em um único comentário
  central em `tokens.css` e usando o mesmo literal nos dois arquivos;
  qualquer novo `@media` de breakpoint mobile deve citar esse comentário.
  Caso o projeto adote uma ferramenta de build com suporte a custom media
  no futuro, esse comentário vira o ponto de migração.
- [Escolher `480px` sem testar em dispositivo físico] → Mitigado
  verificando a mudança com as ferramentas de dispositivo do navegador em
  algumas larguras representativas (360px, 390px, 430px, 480px, 481px)
  durante a implementação, antes de considerar a tarefa concluída.
