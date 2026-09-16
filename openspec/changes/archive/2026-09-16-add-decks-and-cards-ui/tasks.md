## 1. Camada de API

- [x] 1.1 Criar `src/api/decks.js`: `listDecks()`, `createDeck(input)`,
      `getDeck(id)`, `updateDeck(id, input)`, `deleteDeck(id)`, todos via
      `request(path, { auth: true, ... })` — verificar por leitura que
      nenhum usa URL literal, só `API_URL` (via `client.js`).
- [x] 1.2 Criar `src/api/cards.js`: `listCards(deckId, { page, pageSize })`,
      `createCard(deckId, input)`, `getCard(id)`, `updateCard(id, input)`,
      `deleteCard(id)` — mesma verificação.

## 2. Componente de paginação

- [x] 2.1 Criar `src/components/ui/Pagination.jsx` (+ `.css`): recebe
      `page`, `pageSize`, `total`, `onChange`; exibe "Página X de Y" e
      botões anterior/próxima, desabilitados nas pontas — verificar
      manualmente com `total` menor, igual e maior que `pageSize`.
      Adicionado também à galeria (`Gallery.jsx`), por causa do requisito
      já existente em `design-system/components` de que componente novo
      sem galeria é considerado incompleto.
- [x] 2.2 Exportar `Pagination` em `src/components/ui/index.js`.

## 3. Lista de baralhos (tela inicial)

- [x] 3.1 Reescrever `src/pages/HomePage.jsx`: busca `listDecks()` ao
      montar (padrão de `HealthStatus.jsx`: `status`
      `loading`/`ok`/`error`), lista os baralhos (nome + par de idiomas),
      e mensagem própria para "sem baralhos ainda" — verificar as três
      situações manualmente.
- [x] 3.2 Adicionar o formulário de criação de baralho (nome, idioma de
      origem, idioma de destino) usando `useAuthForm`, `Input` e `Button`;
      validação local de campos obrigatórios antes de chamar
      `createDeck` — verificar que campo vazio não gera requisição, e que
      um baralho criado aparece na lista sem recarregar a página.
- [x] 3.3 Cada baralho da lista navega para `/baralhos/:id` ao ser
      selecionado — verificar clicando em um baralho criado no passo
      anterior.

## 4. Detalhe de um baralho

- [x] 4.1 Criar `src/pages/DeckDetailPage.jsx` (+ `.css`): lê `:id` da
      rota, busca `getDeck(id)` ao montar — verificar que os dados do
      baralho (nome, idiomas, `cardCount`) aparecem.
- [x] 4.2 Tratar `403`/`404` de `getDeck`: exibir mensagem de "baralho não
      disponível" com caminho de volta para `/`, no lugar do restante da
      tela — verificar abrindo a URL de um baralho de outra conta (criada
      via `curl` contra o backend) e de um id inexistente.
- [x] 4.3 Formulário de edição do baralho (nome, idiomas) — verificar que
      salvar atualiza o que a tela exibe sem recarregar a página.
- [x] 4.4 Ação de excluir o baralho com confirmação inline (ver design.md:
      sem modal, segundo estado do botão) — verificar que cancelar não
      exclui, e que confirmar exclui e volta para `/`. Extraído como
      `components/ui/ConfirmDeleteButton` (mesma técnica de dois passos do
      design.md), reaproveitado também na exclusão de card (5.5) —
      adicionado à galeria pelo mesmo motivo do `Pagination`.

## 5. Cards do baralho

- [x] 5.1 Buscar `listCards(deckId, { page, pageSize })` dentro de
      `DeckDetailPage`, com `Pagination` controlando `page` — verificar
      criando cards suficientes para mais de uma página (via `curl`) e
      navegando entre elas.
- [x] 5.2 Mensagem própria para baralho sem cards ainda, no lugar de lista
      vazia sem explicação.
- [x] 5.3 Formulário de criação de card (palavra e tradução obrigatórios;
      classe gramatical, sinônimos, frase de exemplo, tradução da frase,
      anotação pessoal opcionais) — verificar que faltar palavra ou
      tradução barra o envio localmente, e que um card criado aparece na
      lista.
- [x] 5.4 Edição de um card existente (mesmos campos) — verificar que
      salvar atualiza o que a lista exibe.
- [x] 5.5 Exclusão de um card com confirmação inline — verificar que
      cancelar não exclui, e que confirmar remove o card da lista.

## 6. Rotas

- [x] 6.1 Adicionar a rota protegida `/baralhos/:id` em `src/routes.jsx`,
      dentro do mesmo grupo de `RequireAuth`/`AuthenticatedLayout` de `/`
      — verificar que abrir a URL diretamente (sem navegar pela lista)
      funciona com sessão ativa, e redireciona para `/entrar` sem sessão.

## 7. Verificação de build e lint

- [x] 7.1 `npm run build` sem erro.
- [x] 7.2 `npm run lint` sem aviso.

## 8. Verificação manual ponta a ponta

- [x] 8.1 Contra o backend local (Postgres local, como nas mudanças
      anteriores): criar um baralho pela UI, criar cards suficientes para
      paginar, editar e excluir um card, editar o baralho, e por fim
      excluí-lo — cada passo confirmado na tela, sem depender de recarregar
      a página. Testado com Playwright de ponta a ponta, incluindo os
      cenários 403 (baralho de outra conta) e 404 (id inexistente).
      Encontrado e corrigido um bug real neste processo: criar um card
      simplesmente anexava ao array local sem respeitar `pageSize`, então
      uma página chegava a mostrar mais itens do que devia; e excluir não
      recarregava a partir do servidor, podendo deixar uma página com menos
      itens do que o necessário quando havia mais páginas. Corrigido
      recarregando a página atual do servidor depois de criar/excluir (a
      técnica de `reload()` já prevista no design.md), com o cuidado
      adicional de voltar uma página se a exclusão esvaziar a última.
- [x] 8.2 Confirmar visualmente os dois temas (claro/escuro) nas telas
      novas. Capturado com Playwright (`colorScheme: 'light'|'dark'`): lista
      de baralhos e detalhe de baralho com um card completo (todos os
      campos opcionais preenchidos) — legível nos dois temas.

## 9. Verificação final

- [x] 9.1 `openspec validate --specs` passa para `decks/screens`.
