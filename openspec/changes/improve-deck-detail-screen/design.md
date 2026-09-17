## Context

Ver `proposal.md`. Depende de `add-card-suspension-and-difficulty`
(mem-words-backend) já mesclado, que passa a expor:

- `GET /decks/:id` → `cardCount`, `dueCount`, `newCount`, `learningCount`,
  `matureCount`, `suspendedCount`, além dos campos já existentes.
- `GET /decks/:id/cards?q=&status=&page=&pageSize=` → mesma forma
  paginada de sempre (`{ items, total, page, pageSize }`), agora
  filtrável por palavra e por `status`.
- Cada card (`PublicCard`) ganha `status` (`new`/`learning`/`difficult`/
  `mature`/`reviewing`/`suspended`) e `suspended` (booleano) — `status` já
  vem com a prioridade entre suspenso/difícil/maduro resolvida pelo
  servidor; a tela não recalcula nada disso.
- `POST /cards/:id/suspend` e `POST /cards/:id/unsuspend` → `{ card }`
  atualizado.

O frontend já tem, e este change reaproveita sem mudar: `Badge` (5
variantes: `neutral`/`success`/`warning`/`danger`/`info`), `Input`,
`Pagination`, `ConfirmDeleteButton` (não usado aqui — suspender não
destrói dado, não precisa de confirmação), o padrão de estado local por
tela (`useState`/`useEffect`/`useCallback`, sem hook genérico), e
`ApiError`/`describeApiError` já usados no restante de
`DeckDetailPage.jsx`.

## Goals / Non-Goals

**Goals:**
- Blocos de contagem, busca, filtro, selo de status e ação de suspender,
  usando só o que o backend já calcula — nenhuma regra de negócio (limiar
  de maturidade, prioridade entre status) duplicada no frontend.
- Buscar/filtrar sem recarregar a tela inteira nem perder a paginação.

**Non-Goals:**
- Suspensão em lote — fora de escopo também no backend.
- Editar o status de um card por qualquer via além de suspender/reativar
  — os demais status (novo/aprendendo/difícil/maduro/em revisão) só mudam
  revisando o card, já coberto pela tela de revisão existente.
- Um seletor de intervalo de datas ou histórico de revisões — o mockup
  só pede a próxima revisão de cada card, já disponível em `dueAt`.

## Decisions

### Mapeamento de `status` para variante de `Badge`, direto na tela

`status` → variante e texto:

| `status`     | variante   | texto     |
| :----------- | :--------- | :-------- |
| `new`        | `info`     | Novo      |
| `learning`   | `warning`  | Aprend.   |
| `difficult`  | `danger`   | Difícil   |
| `mature`     | `success`  | Maduro    |
| `reviewing`  | `neutral`  | Revisão   |
| `suspended`  | `neutral`  | Suspenso  |

Uma função pura `statusBadge(status)` (local a `DeckDetailPage.jsx`, não
um componente novo — é só uma tabela de variante/texto, sem estado nem
lógica própria) devolve os dois valores. Alternativa descartada: um
componente `CardStatusBadge` dedicado. Rejeitada porque `Badge` já faz
exatamente o que é preciso (texto + cor); um componente novo só para
fixar essa tabela seria uma camada sem comportamento próprio.

### Busca e filtro disparam nova busca ao servidor, com debounce só na busca

Alternativa descartada: filtrar em memória sobre a página já carregada.
Rejeitada porque a busca/filtro precisa alcançar os 412 cards do
baralho, não só os 10 da página atual — teria que carregar tudo de
antemão, replicando o problema que a paginação existe para evitar. Em
vez disso, `q`/`status` entram como parâmetros de `listCards` (que já
aceita `page`/`pageSize`), e qualquer mudança neles reinicia `page` para
`1`. A busca usa um debounce de 300ms (mesmo valor comum em outras buscas
"enquanto digita" — não há debounce em nenhuma outra tela do app hoje,
esta é a primeira busca em campo de texto contra o backend); o filtro por
status dispara na hora, por já ser uma escolha discreta (um clique), sem
digitação a esperar.

### Coluna "próxima revisão" formatada no cliente a partir de `dueAt`

Mesmo espírito de `formatDueIn` em `ReviewSessionPage.jsx` (rótulo curto
calculado com `Date` nativo, sem biblioteca de datas — nenhuma existe
neste projeto), mas com sua própria função (`formatNextReview`, local a
`DeckDetailPage.jsx`): a escala é dias, não minutos, e o vocabulário é o
da tela de detalhe, não o da revisão. `dueAt` vencido ou de hoje → "hoje";
um dia à frente → "amanhã"; mais de um dia → "em Nd"; `dueAt` nulo (nunca
revisado, ou suspenso) → "—".

### Suspender/reativar sem confirmação, mas sem mudança otimista

Diferente de excluir (`ConfirmDeleteButton`), suspender não destrói dado
nem é irreversível — reativar desfaz completamente. Por isso o botão age
direto, sem passo de confirmação: mesmo padrão de "editar"/"excluir" já
usado em `CardItem` (estado de carregamento no botão, erro exibido se a
requisição falhar).

Alternativa descartada durante a implementação: atualizar o selo do card
otimisticamente antes da resposta do servidor. Funciona sem ambiguidade
para *suspender* (`suspended` é sempre o status de maior prioridade,
qualquer que seja o `state` do card) — mas *reativar* não tem essa
propriedade: o status que reaparece (`difficult`/`mature`/`reviewing`)
depende do limiar de maturidade e da última nota, exatamente a lógica que
a Decision anterior (`status` calculado no servidor) evita duplicar no
cliente. Prever esse status no cliente só para a janela otimista
reintroduziria a duplicação que o design como um todo evita. Em vez
disso, o botão mostra estado de carregamento (mesmo padrão de
`ConfirmDeleteButton`/formulários da tela) e o selo só muda quando a
resposta do servidor chega — consistente com toda outra mutação desta
tela (criar/editar/excluir card já esperam a resposta do servidor).

### Blocos de contagem: `ProgressBar`/`Card` existentes, sem componente novo

Os quatro blocos (Novos/Aprendendo/Maduros/Suspensos) são `Card`s
simples com um número grande e um rótulo — o mesmo padrão visual que o
mockup mostra, sem gráfico nem barra de progresso (essa já existe na
lista de baralhos, `HomePage.jsx`, para maturidade — aqui é só contagem).
Um componente `StatTile` pequeno, local a `DeckDetailPage.jsx` (não em
`components/ui/`, seguindo o mesmo raciocínio de "sem segundo consumidor
ainda" já registrado no design.md de `add-decks-and-cards-ui` para outros
componentes).

## Risks / Trade-offs

- [Debounce de 300ms na busca] → aceito; não há teste automatizado de UI
  neste repositório para timing, e o valor é ajustável sem migração nem
  mudança de contrato se se mostrar errado na prática.
- [Mudança otimista em suspender/reativar] → aceito porque reativar
  desfaz completamente qualquer suspensão indevida; o risco é só uma
  reversão visual em caso de falha de rede, já comunicada por um alerta.
- [Este change não funciona sozinho] → aceito e documentado: sem
  `add-card-suspension-and-difficulty` mesclado no backend, `status` e as
  contagens novas viriam `undefined`; como o valor default de `status`
  ausente não mapeia para nenhuma linha da tabela de `statusBadge`, a
  tela trataria como `neutral`/texto vazio — degrada, não quebra, mas não
  é o objetivo: a ordem de deploy importa (backend primeiro).

## Migration Plan

Reversível por `git revert`, sem dado de conta a migrar. Se o backend
ainda não tiver o change mesclado, esta tela pode ser revertida
isoladamente sem afetar nenhuma outra.
