## Context

Ver `proposal.md` — Why. Depende de `add-deck-list-stats`
(mem-words-backend) já mesclado: `GET /decks` precisa devolver
`cardCount`, `dueCount` e `matureCount` por baralho para esta tela ter o
que exibir.

## Goals / Non-Goals

**Goals**

- Igualar a densidade de informação do mockup sem introduzir componente
  novo — `Badge` e `ProgressBar` já existem e servem exatamente para isto.
- Criar um baralho não deve exigir rolar até um formulário sempre visível
  quando a pessoa só quer ver a lista.

**Non-Goals**

- Importar `.apkg` do Anki — mencionado no mockup, fora de escopo por
  decisão já tomada (deferido junto com exportar `.csv` e excluir conta,
  na época; excluir conta já foi implementado à parte).
- Mudar o endpoint de criação (`POST /decks`) — a resposta de criação não
  precisa trazer as três contagens nesta mudança, porque um baralho recém
  criado sempre começa com todas em zero (ver Decisions).

## Decisions

### Baralho recém-criado entra com as três contagens zeradas, sem nova ida ao servidor

`POST /decks` continua devolvendo só os campos base (sem `cardCount`,
`dueCount`, `matureCount` — esses são exclusivos da listagem). Buscar a
lista de novo só para pegar zeros garantidos seria uma chamada
desperdiçada: um baralho que acabou de ser criado não pode ter card
algum. O formulário de criação preenche esses três campos com `0`
localmente ao adicionar o baralho novo à lista em memória — mesma técnica
que a tela já usava para não recarregar a lista inteira a cada criação.

### Texto da porcentagem fora do cabeçalho do `ProgressBar`

`ProgressBar` já sabe exibir a porcentagem, mas no cabeçalho, acima da
barra (`showValue`). O mockup mostra o texto "N% maduros" abaixo da
barra. Em vez de mudar o componente para um novo layout que mais nenhuma
outra tela usa, a barra é renderizada sem `label`/`showValue`, e o texto
abaixo dela é um parágrafo comum calculado no próprio `HomePage` — o
componente continua sendo reaproveitado para o que ele sabe fazer (a
barra em si), sem crescer para um caso de uso só seu.

### "Criar baralho" tracejado reaproveita o mesmo estado de revelar/ocultar

O cartão tracejado e o botão "Novo baralho" acionam o mesmo estado
(`creating`) que controla se `CreateDeckForm` aparece — dois pontos de
entrada, um único formulário, sem duplicar lógica.

## Risks / Trade-offs

- Esta mudança só mostra números reais depois que `add-deck-list-stats`
  estiver mesclado no backend; contra um backend antigo, `dueCount` e
  `matureCount` chegariam `undefined` e a tela trataria como `0` (badge
  "em dia", "0% maduros") — degrada de forma silenciosa, não quebra.

## Migration Plan

Reversível por `git revert`, sem dado de conta a migrar.
