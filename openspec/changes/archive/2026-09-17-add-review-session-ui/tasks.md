## 1. Camada de API

- [x] 1.1 Criar `src/api/reviews.js`: `getReviewQueue(deckId)` (devolve o
      array `queue`) e `recordReview(cardId, grade)` (devolve o card
      atualizado), via `request(path, { auth: true, ... })` — verificado
      por leitura que nenhum usa URL literal, só `API_URL` (via
      `client.js`).

## 2. Formatação da prévia

- [x] 2.1 Criar `formatDueIn(dueAt, now)` (local a `ReviewSessionPage.jsx`,
      sem novo arquivo): minutos para diferenças pequenas ("em 6 min"),
      dias para diferenças maiores ("em 3 dias"), "agora" para diferença
      ao redor de zero — verificado contra o backend local, que devolveu
      prévias de "em 1 min" para os passos de aprendizado.

## 3. Tela de sessão de revisão

- [x] 3.1 Criar `src/pages/ReviewSessionPage.jsx` (+ `.css`): lê `:id` da
      rota, busca `getReviewQueue(id)` ao montar — verificado com
      Playwright contra Postgres local: o primeiro card da fila aparece,
      mostrando só a palavra.
- [x] 3.2 Fila vazia (nenhum card pronto): mensagem própria com caminho de
      volta ao detalhe do baralho — verificado revisitando a tela depois
      de todos os cards passarem a `learning` (não vencidos ainda):
      "Nada para revisar agora".
- [x] 3.3 Ação de revelar: mostra tradução, classe gramatical, sinônimos,
      frase de exemplo e anotação pessoal, e as quatro ações de nota, cada
      uma rotulada com `formatDueIn` sobre a prévia daquele card —
      verificado que as ações de nota não aparecem antes de revelar (0
      botões) e aparecem depois (4 botões, com o rótulo e a prévia em
      duas linhas — conferido visualmente nos dois temas).
- [x] 3.4 Ação de nota: `recordReview(cardId, grade)`; sucesso avança para
      o próximo card da fila (tradução oculta de novo); a fila em si não é
      buscada de novo — verificado avançando por uma fila de 3 cards
      ("Revisão — 1 de 3" → "2 de 3" → "3 de 3").
- [x] 3.5 Último card notado: mensagem de sessão concluída, com caminho de
      volta ao detalhe do baralho — verificado no card final da fila de 3.
- [x] 3.6 Falha ao registrar uma nota: card atual continua exibido, com a
      recusa comunicada (`ApiError`), ações de nota continuam disponíveis
      — verificado interceptando a requisição para forçar um `500` uma
      vez: o card permaneceu, o alerta apareceu, os 4 botões continuaram
      disponíveis, e a nova tentativa (sem interceptação) teve sucesso.
- [x] 3.7 Estado de envio em curso: a ação de nota escolhida indica
      carregamento e impede novo envio para o mesmo card — implementado
      via `submittingGrade`, desabilitando as demais notas durante o
      envio; comportamento coerente com o mesmo padrão já usado nas
      outras telas (`useAuthForm`/`submitting`).

## 4. Ação de revisar na tela de detalhe

- [x] 4.1 Em `DeckDetailPage.jsx`: buscar `getReviewQueue(id)` junto do
      carregamento do baralho, e exibir a contagem (`queue.length`) junto
      de um botão/link "Revisar" que leva a `/baralhos/:id/revisar` —
      verificado que a contagem foi de `0` (baralho recém-criado, sem
      cards) para `1` (um card criado) e para `3` (três cards criados),
      recarregando a tela entre os passos.

## 5. Rotas

- [x] 5.1 Adicionar a rota protegida `/baralhos/:id/revisar` em
      `src/routes.jsx`, no mesmo grupo de `RequireAuth`/`AuthenticatedLayout`
      — verificado abrindo a URL diretamente com sessão ativa (funciona) e
      via o botão "Revisar" da tela de detalhe.

## 6. Verificação de build e lint

- [x] 6.1 `npm run build` sem erro.
- [x] 6.2 `npm run lint` sem aviso.

## 7. Verificação manual ponta a ponta

- [x] 7.1 Contra o backend local (Postgres local): baralho com 3 cards,
      contagem de "prontos" conferida em cada passo, sessão completa
      percorrida (revelar, notar `good`, avançar, concluir), e confirmado
      que os cards notados (agora em `learning`, `dueAt` no futuro)
      somem da contagem ao revisitar a tela.
- [x] 7.2 Confirmado visualmente nos dois temas (claro/escuro): card
      revelado, com tradução, classe gramatical, sinônimos, frase de
      exemplo e anotação pessoal, e os quatro botões de nota com a
      prévia — legível nos dois.

## 8. Verificação final

- [x] 8.1 `openspec validate --specs` passa para `decks/review-screen` e
      `decks/screens`.
