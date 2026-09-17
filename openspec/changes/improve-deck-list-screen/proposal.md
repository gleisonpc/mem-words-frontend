## Why

O mockup da tela de baralhos mostra bem mais do que a lista atual exibe: um
selo por baralho indicando quantos cards estão prontos para revisão hoje
(ou "em dia"), o total de cards, e uma barra de progresso com a fração de
cards já maduros. A tela atual só mostra nome e par de idiomas, numa lista
simples, com o formulário de criação sempre visível abaixo — o mockup
mostra um botão "Novo baralho" e um cartão tracejado "Criar baralho" como
pontos de entrada, sem formulário permanente na tela.

O backend já passou a expor `cardCount`, `dueCount` e `matureCount` por
baralho em `GET /decks` (`add-deck-list-stats`, mem-words-backend) — falta
a tela consumir isso.

## What Changes

- A tela ganha um cabeçalho "Baralhos" com o botão "Novo baralho" à
  direita, no lugar do título de cartão atual.
- Cada baralho vira um cartão na grade, mostrando: nome, selo ("N hoje" em
  âmbar quando há cards prontos, "em dia" em verde quando não há), total
  de cards e par de idiomas, e uma barra de progresso com "N% maduros"
  (baralho sem nenhum card mostra "Sem cards ainda" no lugar da barra).
- A grade ganha um último cartão tracejado "Criar baralho", que é mais um
  ponto de entrada para a criação (sem menção a importar `.apkg` — fora
  de escopo, decisão já tomada em mudança anterior).
- O formulário de criação deixa de ficar sempre visível: aparece ao
  acionar "Novo baralho" ou o cartão tracejado, e se oculta ao cancelar
  ou ao criar com sucesso.

## Impact

**Código afetado**

- `src/pages/HomePage.jsx`/`.css` — reestruturação da tela.
- `src/api/decks.js` — nenhuma mudança de assinatura; `listDecks()` passa
  a devolver os três campos novos, que o backend já inclui.

**Specs afetadas**

- `decks/screens`: os requisitos "Lista dos próprios baralhos" e "Criação
  de baralho" são ampliados — selo, progresso de maturidade, e formulário
  revelado sob demanda.

Sem novo componente de design system (reaproveita `Badge` e `ProgressBar`,
já existentes e não usados nesta tela até agora).
