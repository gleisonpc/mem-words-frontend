## 1. Marca como link para a tela inicial

- [x] 1.1 Em `src/components/AuthenticatedLayout.jsx`, trocar o `<p
      className="shell__brand">` por `<Link to="/" className="shell__brand">`.
- [x] 1.2 Em `AuthenticatedLayout.css`, `.shell__brand` ganha `color:
      inherit` e `text-decoration: none` (hoje só estiliza um `<p>`, sem
      reset de link).

## 2. Detalhe do baralho

- [x] 2.1 Em `src/pages/DeckDetailPage.jsx`, adicionar um link "←
      Baralhos" para `/`, visível também no estado carregado com sucesso
      (hoje só aparece no estado indisponível). Adicionado também no
      estado de carregamento, para o mesmo caminho existir desde o
      primeiro instante da tela.

## 3. Sessão de revisão

- [x] 3.1 Em `src/pages/ReviewSessionPage.jsx`, adicionar a ação
      "Encerrar" (link para `/baralhos/:id`) na `Card` exibida durante a
      revisão ativa (`actions` do cabeçalho), ao lado do título "Revisão —
      X de Y". Adicionada também no estado de carregamento da fila.

## 4. Verificação de build e lint

- [x] 4.1 `npm run build` sem erro.
- [x] 4.2 `npm run lint` sem aviso.

## 5. Verificação manual ponta a ponta

- [x] 5.1 Contra o backend local, via Playwright
      (`/tmp/pw-check/verify-back-nav.mjs`): da lista de baralhos, abrir
      um baralho e clicar na marca "mem-words" volta à lista (`/`); do
      detalhe de um baralho, clicar em "← Baralhos" volta à lista; de uma
      sessão de revisão ativa, clicar em "Encerrar" antes de revelar a
      tradução volta ao detalhe do baralho correto, e reabrir a revisão
      em seguida confirma que o card ainda está na fila (a sessão não foi
      consumida do lado do backend); repetido com a tradução já revelada
      (grades visíveis) — "Encerrar" continua funcionando.
- [x] 5.2 Confirmado visualmente (`deck-detail-back-{light,dark}.png`,
      `review-encerrar-{light,dark}.png`) — "← Baralhos" e "Encerrar"
      aparecem legíveis e bem posicionados nos dois temas, sem regressão.

## 6. Verificação final

- [x] 6.1 `openspec validate --specs` passa para `navigation/routing`,
      `decks/screens` e `decks/review-screen`.
