## 1. Cliente HTTP

- [x] 1.1 Em `src/api/reviews.js`, adicionar `getTodaySummary()`, chamando `GET /reviews/today` e devolvendo o objeto `today` (`{ dueCount, newCount, learningCount, reviewCount }`)

## 2. Saudação e sequência

- [x] 2.1 Escrever `greeting(now)` (local a `HomePage.jsx`): "Bom dia"/"Boa tarde"/"Boa noite" a partir de `now.getHours()`
- [x] 2.2 Renderizar a saudação com o primeiro nome de `useAuth().user`, e o selo de sequência (`Badge`) quando `user.currentStreak > 0`

## 3. Resumo "Revisão de hoje"

- [x] 3.1 Buscar `getTodaySummary()` em paralelo com `listDecks()` no `useEffect` inicial, com `status` (`loading`/`ok`/`error`) próprio, independente do status da lista de baralhos
- [x] 3.2 Criar `DueComposition` (local a `HomePage.jsx`): três segmentos proporcionais a `newCount`/`learningCount`/`reviewCount`, cores `--color-info`/`--color-warning`/`--color-text-muted`
- [x] 3.3 Renderizar o cartão com o total, os três `Badge`s (`info`/`warning`/`neutral`), `DueComposition` e o tempo estimado (`Math.max(1, Math.round(dueCount * 20 / 60))` min)
- [x] 3.4 Estado sem nada pronto (`dueCount === 0`): mensagem em vez de contagens zeradas, botão de começar revisão desabilitado
- [x] 3.5 Estado de erro do resumo (`status === 'error'`): `Alert` só nessa seção, sem afetar a lista de baralhos abaixo
- [x] 3.6 Sem baralho nenhum: cartão de revisão de hoje não aparece (o estado vazio de "Meus baralhos" já cobre o convite para criar o primeiro)

## 4. Ações rápidas

- [x] 4.1 "Começar revisão": encontrar, em `decks` (ordem já devolvida por `GET /decks`), o primeiro com `dueCount > 0` e navegar para `/baralhos/:id/revisar`; desabilitado quando nenhum baralho tem `dueCount > 0`
- [x] 4.2 "Adicionar palavra": com um baralho, navegar direto para `/baralhos/:id`; com mais de um, revelar um seletor compacto (lista dos nomes) e navegar ao escolher; sem nenhum, ação ausente

## 5. Lista de baralhos em linhas

- [x] 5.1 Trocar `home__grid`/`DeckTile` (cartões) por uma lista de linhas: nome, "N cards · origem → destino", selo de prontos/em dia e ação "Revisar" (link direto para `/baralhos/:id/revisar` quando há prontos)
- [x] 5.2 Remover a barra de maturidade da tela inicial (`ProgressBar`/`maturePercent` em `DeckTile`) — fica só na tela de detalhe
- [x] 5.3 Manter clique na linha (fora da ação "Revisar") levando a `/baralhos/:id`, e o botão/estado vazio de criar baralho como hoje

## 6. Verificação final

- [x] 6.1 Rodar `npm run lint` e confirmar que passa sem erros
- [x] 6.2 Rodar `npm run build` e confirmar que o build de produção passa sem erros
- [x] 6.3 Testar manualmente no dev server, contra um backend com `add-home-dashboard-summary` mesclado: saudação, selo de sequência, resumo de revisão de hoje (com e sem cards prontos), começar revisão, adicionar palavra (um baralho e vários), lista de baralhos em linhas, e o mesmo fluxo com nenhum baralho
