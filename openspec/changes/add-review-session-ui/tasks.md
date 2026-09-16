## 1. Camada de API

- [ ] 1.1 Criar `src/api/reviews.js`: `getReviewQueue(deckId)` (devolve o
      array `queue`) e `recordReview(cardId, grade)` (devolve o card
      atualizado), via `request(path, { auth: true, ... })` — verificar
      por leitura que nenhum usa URL literal, só `API_URL` (via
      `client.js`).

## 2. Formatação da prévia

- [ ] 2.1 Criar `formatDueIn(dueAt, now)` (local a `ReviewSessionPage.jsx`,
      sem novo arquivo): minutos para diferenças pequenas ("em 6 min"),
      dias para diferenças maiores ("em 3 dias"), "agora" para diferença
      ao redor de zero — verificar manualmente com valores de cada faixa
      (ex.: 1 min, 90 min, 1 dia, 10 dias).

## 3. Tela de sessão de revisão

- [ ] 3.1 Criar `src/pages/ReviewSessionPage.jsx` (+ `.css`): lê `:id` da
      rota, busca `getReviewQueue(id)` ao montar — verificar que o
      primeiro card da fila aparece, mostrando só a palavra.
- [ ] 3.2 Fila vazia (nenhum card pronto): mensagem própria com caminho de
      volta ao detalhe do baralho — verificar contra um baralho sem cards
      prontos.
- [ ] 3.3 Ação de revelar: mostra tradução, classe gramatical, sinônimos,
      frase de exemplo e anotação pessoal (os campos preenchidos, mesmo
      layout de leitura já usado em `DeckDetailPage`), e as quatro ações
      de nota, cada uma rotulada com `formatDueIn` sobre a prévia daquele
      card — verificar que as ações de nota não aparecem antes de revelar.
- [ ] 3.4 Ação de nota: `recordReview(cardId, grade)`; sucesso avança para
      o próximo card da fila (tradução oculta de novo); a fila em si não é
      buscada de novo — verificar avançando por 2-3 cards.
- [ ] 3.5 Último card notado: mensagem de sessão concluída, com caminho de
      volta ao detalhe do baralho — verificar no card final de uma fila
      pequena.
- [ ] 3.6 Falha ao registrar uma nota: card atual continua exibido, com a
      recusa comunicada (`ApiError`), ações de nota continuam disponíveis
      — verificar simulando uma falha (ex.: desligar o backend por um
      instante ou usar um id de card inválido diretamente).
- [ ] 3.7 Estado de envio em curso: a ação de nota escolhida indica
      carregamento e impede novo envio para o mesmo card — verificar
      clicando repetidamente durante o envio.

## 4. Ação de revisar na tela de detalhe

- [ ] 4.1 Em `DeckDetailPage.jsx`: buscar `getReviewQueue(id)` junto do
      carregamento do baralho, e exibir a contagem (`queue.length`) junto
      de um botão/link "Revisar" que leva a `/baralhos/:id/revisar` —
      verificar que a contagem muda conforme cards são criados/notados
      entre uma visita e outra à tela.

## 5. Rotas

- [ ] 5.1 Adicionar a rota protegida `/baralhos/:id/revisar` em
      `src/routes.jsx`, no mesmo grupo de `RequireAuth`/`AuthenticatedLayout`
      — verificar que abrir a URL diretamente funciona com sessão ativa, e
      redireciona para `/entrar` sem sessão.

## 6. Verificação de build e lint

- [ ] 6.1 `npm run build` sem erro.
- [ ] 6.2 `npm run lint` sem aviso.

## 7. Verificação manual ponta a ponta

- [ ] 7.1 Contra o backend local (Postgres local): criar um baralho com
      cards suficientes para passar por `new` → `learning` → `review`
      (repetindo a sequência de notas já verificada no backend), conferir
      a contagem de "prontos" na tela de detalhe, percorrer uma sessão
      completa (revelar, notar, avançar, terminar), e conferir que um
      card notado como `learning` some da contagem até o `dueAt` passar.
- [ ] 7.2 Confirmar visualmente os dois temas (claro/escuro) na tela nova.

## 8. Verificação final

- [ ] 8.1 `openspec validate --specs` passa para `decks/review-screen` e
      `decks/screens`.
