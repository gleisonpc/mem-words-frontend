## 1. Cliente HTTP

- [ ] 1.1 Em `src/api/cards.js`, estender `listCards(deckId, { page, pageSize, q, status })` para incluir `q`/`status` na querystring quando informados, e verificar manualmente (chamada em `/diagnostico` ou console do dev server) que a URL montada é a esperada
- [ ] 1.2 Adicionar `suspendCard(id)` e `unsuspendCard(id)` em `src/api/cards.js`, chamando `POST /cards/:id/suspend`/`unsuspend` e devolvendo o card atualizado, no mesmo formato de `updateCard`

## 2. Blocos de contagem por status

- [ ] 2.1 Criar `StatTile` local a `DeckDetailPage.jsx` (número + rótulo, usando `Card` do design system) e renderizar os quatro blocos (Novos/Aprendendo/Maduros/Suspensos) a partir de `deck.newCount`/`learningCount`/`matureCount`/`suspendedCount`
- [ ] 2.2 Verificar visualmente (dev server) que os quatro blocos aparecem com `0` para um baralho recém-criado, sem cards

## 3. Selo de status e próxima revisão

- [ ] 3.1 Escrever `statusBadge(status)` (tabela de variante/texto do design.md) e `formatNextReview(dueAt, now)` (regra "hoje"/"amanhã"/"em Nd"/"—") local a `DeckDetailPage.jsx`
- [ ] 3.2 Substituir a exibição atual de cada `CardItem` para incluir o `Badge` de status (via `statusBadge`) e a próxima revisão (via `formatNextReview`)
- [ ] 3.3 Verificar visualmente com um baralho com cards em pelo menos três status diferentes que cada selo e cada data aparecem corretos

## 4. Busca e filtro

- [ ] 4.1 Adicionar campo de busca (`Input`) e filtro de status (usar o padrão de campo já existente, ex. um `<select>` simples com as opções todos/novo/aprendendo/difícil/maduro/em revisão/suspenso) acima da lista de cards, com estado local (`search`, `statusFilter`)
- [ ] 4.2 Aplicar debounce de 300ms a `search` antes de repassá-lo a `loadCards`, e disparar `loadCards` imediatamente quando `statusFilter` mudar
- [ ] 4.3 Reiniciar `page` para `1` sempre que `search` (após debounce) ou `statusFilter` mudarem
- [ ] 4.4 Passar `q`/`status` para `listCards` em `loadCards`, e verificar que a paginação exibida (`Pagination`) reflete o `total` já filtrado
- [ ] 4.5 Exibir uma mensagem de "nenhum card encontrado" quando a busca/filtro não casarem com nada, distinta da mensagem de "baralho sem cards ainda"

## 5. Suspender e reativar

- [ ] 5.1 Adicionar botão de suspender/reativar em `CardItem`, com rótulo e ação dependendo de `card.suspended`
- [ ] 5.2 Implementar a atualização otimista: trocar `card.status`/`card.suspended` localmente antes da resposta do servidor, confirmando ou revertendo conforme o resultado de `suspendCard`/`unsuspendCard`
- [ ] 5.3 Em falha, reverter a mudança otimista e exibir o erro (mesmo padrão de `describeApiError` já usado nos outros formulários da tela)
- [ ] 5.4 Verificar visualmente que suspender e reativar atualizam o selo do card sem recarregar a página, e que os blocos de contagem (`StatTile`) refletem a mudança após a ação (recarregando o baralho, mesma técnica de `handleCardCreated`/`handleCardDeleted` já usada na tela)

## 6. Cabeçalho do baralho

- [ ] 6.1 Substituir a lista de definição atual (`Idiomas`/`Cards`) por uma linha única "N cards · origem → destino · criado em `<mês>`", formatando `createdAt` com o mês por extenso (`Intl.DateTimeFormat` com `locale: 'pt-BR'`, sem biblioteca nova)
- [ ] 6.2 Verificar visualmente que a linha aparece corretamente em um baralho com cards e em um sem nenhum

## 7. Verificação final

- [ ] 7.1 Rodar `npm run lint` e confirmar que passa sem erros
- [ ] 7.2 Rodar `npm run build` e confirmar que o build de produção passa sem erros
- [ ] 7.3 Testar manualmente no dev server, contra um backend com `add-card-suspension-and-difficulty` mesclado: buscar, filtrar, suspender, reativar, paginar, e confirmar que os quatro blocos e os selos refletem o estado real do baralho
