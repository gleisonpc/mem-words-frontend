## Why

O backend já expõe o motor de revisão espaçada (`mem-words-backend`,
mudança `add-review-scheduling`, mergeada) — fila de cards prontos para
revisão e o registro de nota. O frontend ainda não tem tela nenhuma para
isso: dá para criar baralhos e cards, mas não para estudá-los, que é a
única coisa que o nome do produto promete.

## What Changes

- Nova tela de sessão de revisão, em rota própria (`/baralhos/:id/revisar`):
  busca a fila do baralho (`GET /decks/:id/reviews/queue`), mostra um card
  por vez — palavra, depois a tradução ao ser revelada — e as quatro ações
  de nota (`Errei`/`Difícil`/`Bom`/`Fácil`), cada uma com a prévia de
  quando o card volta (hoje, em N min, em N dias), sem chamada extra ao
  backend. Ao registrar uma nota (`POST /cards/:id/reviews`), avança para o
  próximo card da fila; ao fim, mostra que a sessão terminou.
- A tela de detalhe do baralho ganha a ação de iniciar uma revisão,
  indicando quantos cards estão prontos agora.
- Novo módulo `src/api/reviews.js`, reaproveitando o cliente HTTP único
  existente. Nenhuma dependência nova.

## Capabilities

### New Capabilities

- `decks/review-screen`: a tela de sessão de revisão — como a fila é
  percorrida, o que cada nota faz, o que a prévia mostra, e o que a tela
  garante a quem navega por teclado ou usa leitor de tela.

### Modified Capabilities

- `decks/screens`: a tela de detalhe de um baralho passa a oferecer a ação
  de iniciar uma revisão.

## Impact

- `src/pages/`: nova tela `ReviewSessionPage.jsx` (+ CSS).
- `src/pages/DeckDetailPage.jsx`: novo botão/link para a revisão, com a
  contagem de cards prontos.
- `src/api/reviews.js`: novo módulo (`getReviewQueue`, `recordReview`).
- `src/routes.jsx`: nova rota protegida `/baralhos/:id/revisar`.
- `src/components/ui/`: reaproveitados sem mudança (`Button`, `Card`,
  `Alert`, `Badge`, `Spinner`); nenhum componente novo é esperado.
- Nenhuma dependência nova; nenhuma mudança no backend.
