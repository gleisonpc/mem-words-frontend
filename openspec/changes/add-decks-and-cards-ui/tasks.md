## 1. Camada de API

- [ ] 1.1 Criar `src/api/decks.js`: `listDecks()`, `createDeck(input)`,
      `getDeck(id)`, `updateDeck(id, input)`, `deleteDeck(id)`, todos via
      `request(path, { auth: true, ... })` — verificar por leitura que
      nenhum usa URL literal, só `API_URL` (via `client.js`).
- [ ] 1.2 Criar `src/api/cards.js`: `listCards(deckId, { page, pageSize })`,
      `createCard(deckId, input)`, `getCard(id)`, `updateCard(id, input)`,
      `deleteCard(id)` — mesma verificação.

## 2. Componente de paginação

- [ ] 2.1 Criar `src/components/ui/Pagination.jsx` (+ `.css`): recebe
      `page`, `pageSize`, `total`, `onChange`; exibe "Página X de Y" e
      botões anterior/próxima, desabilitados nas pontas — verificar
      manualmente com `total` menor, igual e maior que `pageSize`.
- [ ] 2.2 Exportar `Pagination` em `src/components/ui/index.js`.

## 3. Lista de baralhos (tela inicial)

- [ ] 3.1 Reescrever `src/pages/HomePage.jsx`: busca `listDecks()` ao
      montar (padrão de `HealthStatus.jsx`: `status`
      `loading`/`ok`/`error`), lista os baralhos (nome + par de idiomas),
      e mensagem própria para "sem baralhos ainda" — verificar as três
      situações manualmente.
- [ ] 3.2 Adicionar o formulário de criação de baralho (nome, idioma de
      origem, idioma de destino) usando `useAuthForm`, `Input` e `Button`;
      validação local de campos obrigatórios antes de chamar
      `createDeck` — verificar que campo vazio não gera requisição, e que
      um baralho criado aparece na lista sem recarregar a página.
- [ ] 3.3 Cada baralho da lista navega para `/baralhos/:id` ao ser
      selecionado — verificar clicando em um baralho criado no passo
      anterior.

## 4. Detalhe de um baralho

- [ ] 4.1 Criar `src/pages/DeckDetailPage.jsx` (+ `.css`): lê `:id` da
      rota, busca `getDeck(id)` ao montar — verificar que os dados do
      baralho (nome, idiomas, `cardCount`) aparecem.
- [ ] 4.2 Tratar `403`/`404` de `getDeck`: exibir mensagem de "baralho não
      disponível" com caminho de volta para `/`, no lugar do restante da
      tela — verificar abrindo a URL de um baralho de outra conta (criada
      via `curl` contra o backend) e de um id inexistente.
- [ ] 4.3 Formulário de edição do baralho (nome, idiomas) — verificar que
      salvar atualiza o que a tela exibe sem recarregar a página.
- [ ] 4.4 Ação de excluir o baralho com confirmação inline (ver design.md:
      sem modal, segundo estado do botão) — verificar que cancelar não
      exclui, e que confirmar exclui e volta para `/`.

## 5. Cards do baralho

- [ ] 5.1 Buscar `listCards(deckId, { page, pageSize })` dentro de
      `DeckDetailPage`, com `Pagination` controlando `page` — verificar
      criando cards suficientes para mais de uma página (via `curl`) e
      navegando entre elas.
- [ ] 5.2 Mensagem própria para baralho sem cards ainda, no lugar de lista
      vazia sem explicação.
- [ ] 5.3 Formulário de criação de card (palavra e tradução obrigatórios;
      classe gramatical, sinônimos, frase de exemplo, tradução da frase,
      anotação pessoal opcionais) — verificar que faltar palavra ou
      tradução barra o envio localmente, e que um card criado aparece na
      lista.
- [ ] 5.4 Edição de um card existente (mesmos campos) — verificar que
      salvar atualiza o que a lista exibe.
- [ ] 5.5 Exclusão de um card com confirmação inline — verificar que
      cancelar não exclui, e que confirmar remove o card da lista.

## 6. Rotas

- [ ] 6.1 Adicionar a rota protegida `/baralhos/:id` em `src/routes.jsx`,
      dentro do mesmo grupo de `RequireAuth`/`AuthenticatedLayout` de `/`
      — verificar que abrir a URL diretamente (sem navegar pela lista)
      funciona com sessão ativa, e redireciona para `/entrar` sem sessão.

## 7. Verificação de build e lint

- [ ] 7.1 `npm run build` sem erro.
- [ ] 7.2 `npm run lint` sem aviso.

## 8. Verificação manual ponta a ponta

- [ ] 8.1 Contra o backend local (Postgres local, como nas mudanças
      anteriores): criar um baralho pela UI, criar cards suficientes para
      paginar, editar e excluir um card, editar o baralho, e por fim
      excluí-lo — cada passo confirmado na tela, sem depender de recarregar
      a página.
- [ ] 8.2 Confirmar visualmente os dois temas (claro/escuro) nas telas
      novas.

## 9. Verificação final

- [ ] 9.1 `openspec validate --specs` passa para `decks/screens`.
