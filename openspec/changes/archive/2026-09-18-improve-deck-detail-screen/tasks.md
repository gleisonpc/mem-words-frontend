## 1. Cliente HTTP

- [x] 1.1 Em `src/api/cards.js`, estender `listCards(deckId, { page, pageSize, q, status })` para incluir `q`/`status` na querystring quando informados, e verificar manualmente (chamada em `/diagnostico` ou console do dev server) que a URL montada é a esperada
- [x] 1.2 Adicionar `suspendCard(id)` e `unsuspendCard(id)` em `src/api/cards.js`, chamando `POST /cards/:id/suspend`/`unsuspend` e devolvendo o card atualizado, no mesmo formato de `updateCard`

## 2. Blocos de contagem por status

- [x] 2.1 Criar `StatTile` local a `DeckDetailPage.jsx` (número + rótulo, usando `Card` do design system) e renderizar os quatro blocos (Novos/Aprendendo/Maduros/Suspensos) a partir de `deck.newCount`/`learningCount`/`matureCount`/`suspendedCount`
- [ ] 2.2 Verificar visualmente (dev server) que os quatro blocos aparecem com `0` para um baralho recém-criado, sem cards

## 3. Selo de status e próxima revisão

- [x] 3.1 Escrever `statusBadge(status)` (tabela de variante/texto do design.md) e `formatNextReview(dueAt, now)` (regra "hoje"/"amanhã"/"em Nd"/"—") local a `DeckDetailPage.jsx`
- [x] 3.2 Substituir a exibição atual de cada `CardItem` para incluir o `Badge` de status (via `statusBadge`) e a próxima revisão (via `formatNextReview`)
- [ ] 3.3 Verificar visualmente com um baralho com cards em pelo menos três status diferentes que cada selo e cada data aparecem corretos

## 4. Busca e filtro

- [x] 4.1 Adicionar campo de busca (`Input`) e filtro de status (usar o padrão de campo já existente, ex. um `<select>` simples com as opções todos/novo/aprendendo/difícil/maduro/em revisão/suspenso) acima da lista de cards, com estado local (`search`, `statusFilter`)
- [x] 4.2 Aplicar debounce de 300ms a `search` antes de repassá-lo a `loadCards`, e disparar `loadCards` imediatamente quando `statusFilter` mudar
- [x] 4.3 Reiniciar `page` para `1` sempre que `search` (após debounce) ou `statusFilter` mudarem
- [x] 4.4 Passar `q`/`status` para `listCards` em `loadCards`, e verificar que a paginação exibida (`Pagination`) reflete o `total` já filtrado
- [x] 4.5 Exibir uma mensagem de "nenhum card encontrado" quando a busca/filtro não casarem com nada, distinta da mensagem de "baralho sem cards ainda"

## 5. Suspender e reativar

- [x] 5.1 Adicionar botão de suspender/reativar em `CardItem`, com rótulo e ação dependendo de `card.suspended`, e estado de carregamento durante o envio (mesmo padrão de `ConfirmDeleteButton`/formulários da tela — ver revisão da Decision correspondente em design.md: sem atualização otimista, para não duplicar no cliente a lógica de prioridade/limiar que decide o status ao reativar)
- [x] 5.2 Ao suspender/reativar com sucesso, atualizar o card na lista com a resposta do servidor (mesmo papel de `onUpdated`, mas também recarregando o baralho para os blocos de contagem — mesma técnica de `handleCardCreated`/`handleCardDeleted` já usada na tela)
- [x] 5.3 Em falha, exibir o erro (mesmo padrão de `describeApiError` já usado nos outros formulários da tela), sem alterar o selo do card
- [ ] 5.4 Verificar visualmente que suspender e reativar atualizam o selo do card sem recarregar a página, e que os blocos de contagem (`StatTile`) refletem a mudança após a ação

## 6. Cabeçalho do baralho

- [x] 6.1 Substituir a lista de definição atual (`Idiomas`/`Cards`) por uma linha única "N cards · origem → destino · criado em `<mês>`", formatando `createdAt` com o mês por extenso (`Intl.DateTimeFormat` com `locale: 'pt-BR'`, sem biblioteca nova)
- [ ] 6.2 Verificar visualmente que a linha aparece corretamente em um baralho com cards e em um sem nenhum

## 7. Verificação final

- [x] 7.1 Rodar `npm run lint` e confirmar que passa sem erros
- [x] 7.2 Rodar `npm run build` e confirmar que o build de produção passa sem erros
- [ ] 7.3 Testar manualmente no dev server, contra um backend com `add-card-suspension-and-difficulty` mesclado: buscar, filtrar, suspender, reativar, paginar, e confirmar que os quatro blocos e os selos refletem o estado real do baralho
