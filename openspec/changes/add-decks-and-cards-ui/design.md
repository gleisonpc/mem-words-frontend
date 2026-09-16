## Context

Ver `proposal.md` para motivação. O backend (`mem-words-backend`, mudança
`add-decks-and-cards`) já expõe:

- `GET/POST /decks`, `GET/PATCH/DELETE /decks/:id` — `{ id, name,
  sourceLanguage, targetLanguage, createdAt, updatedAt }`, e o detalhe
  (`GET /decks/:id`) inclui também `cardCount`.
- `GET/POST /decks/:id/cards`, `GET/PATCH/DELETE /cards/:id` — card:
  `{ id, word, translation, partOfSpeech, synonyms, exampleSentence,
  exampleTranslation, personalNote, state, deckId, createdAt, updatedAt }`.
  A listagem pagina por `page`/`pageSize` (`pageSize` padrão 50, máximo
  200) e responde `{ items, total, page, pageSize }`.
- Posse verificada no backend: um `id` inexistente responde `404`; um
  baralho ou card de outro usuário responde `403`.

O frontend já tem, e este change reaproveita sem mudar:
- `src/api/client.js`: `request(path, { method, body, auth })`, cliente
  único, com renovação de sessão embutida.
- `src/api/ApiError.js`: `status`, `code`, `fieldErrors` (mapa campo →
  mensagem, já sem o prefixo `body.`/`params.` que o backend usa).
- `src/auth/useAuthForm.js`: estado de formulário (valores, erro por
  campo, erro geral, envio em curso) — genérico, não específico de
  autenticação apesar do nome do arquivo.
- `src/components/ui/`: `Card`, `Button`, `Input`, `Alert`, `Badge`,
  `Spinner`. Nenhum modal/diálogo e nenhuma paginação existem ainda.
- Busca de dados fora do fluxo de autenticação já tem um precedente:
  `HealthStatus.jsx` usa `useState`/`useEffect`/`useCallback` local, sem
  hook genérico de data-fetching. Este change segue o mesmo padrão.

## Goals / Non-Goals

**Goals:**
- Lista de baralhos e detalhe de baralho com CRUD completo de baralhos e
  cards, incluindo paginação de cards.
- Reaproveitar 100% dos componentes e do cliente HTTP existentes.
- Tratar `403`/`404` do backend com uma mensagem clara, sem tela quebrada.

**Non-Goals:**
- Qualquer coisa de revisão espaçada (SRS) — fora de escopo também no
  backend.
- Edição em lote, importação, ou busca/filtro de cards — o volume esperado
  por baralho é baixo (a paginação já existe por causa de baralhos grandes
  eventuais, não porque é esperado ser o caso comum).
- Otimização de performance de listas grandes (virtualização) — a
  paginação do backend já limita o tamanho de cada página.

## Decisions

### `useAuthForm` reaproveitado como está, sem renomear

O hook já é genérico (valores, erro por campo, erro geral, envio em
curso, tradução de `ApiError` em erro de formulário) — nada nele é
específico de autenticação além do nome do arquivo. Renomear/mover
agora (para `src/forms/useForm.js`, por exemplo) tocaria as duas telas de
autenticação sem necessidade para este change. Fica como está; um
rename é um refactor isolado, para outra hora se incomodar.

### Confirmação de exclusão: sem modal, com passo inline

O design system não tem um componente de diálogo/modal. Criar um agora só
para dois usos (excluir baralho, excluir card) seria a abstração chegando
antes da necessidade repetida. Em vez disso, o botão "Excluir" tem um
segundo estado: primeiro clique troca o botão por "Confirmar exclusão" e
"Cancelar" lado a lado (usando `Button` existente, variantes `danger` e
`ghost`); um novo clique fora ou em "Cancelar" desfaz. Sem dependência
nova, sem componente novo, sem foco preso (não há overlay).

Alternativa descartada: `window.confirm`. Funciona, mas foge do design
system (aparência do navegador, não do app) e não é testável com os
mesmos meios que o resto da UI.

### Paginação: componente novo em `components/ui/`, não local à tela

Só a tela de detalhe do baralho pagina hoje, mas o mockup do produto já
prevê outras listas paginadas (revisão, estatísticas — fora de escopo
aqui, mas o componente é genérico o bastante para não custar nada deixá-lo
em `ui/`). `Pagination`: recebe `page`, `pageSize`, `total` e `onChange`;
renderiza "Página X de Y" e os botões anterior/próxima (`Button`
existente, desabilitados nas pontas). Sem lista de números de página — o
volume esperado não justifica.

### Busca de dados: estado local por tela, sem hook genérico

Seguindo o precedente de `HealthStatus.jsx`: cada tela guarda seu próprio
`{ status: 'loading' | 'ok' | 'error', data, error }` com
`useState`/`useEffect`/`useCallback`, e expõe uma função `reload` chamada
depois de criar/editar/excluir — sem cache, sem invalidação entre telas,
porque nada aqui é compartilhado entre a lista e o detalhe (a lista não
volta a ser exibida enquanto o detalhe está aberto).

Alternativa descartada: um hook `useResource(fetcher)` compartilhado entre
as duas telas. As duas telas têm formatos de estado diferentes o
suficiente (lista simples vs. detalhe + cards paginados + várias ações de
mutação) que a abstração economizaria pouco e esconderia o que cada tela
realmente faz.

### Erro de baralho/card indisponível: mensagem substitui a tela, não convive com ela

Quando `GET /decks/:id` responde `403` ou `404`, a tela de detalhe SHALL
exibir só a mensagem de indisponível e o caminho de volta — não o
esqueleto da tela (formulário de card, paginação) vazio por trás. Um card
ou baralho listados que, entre o carregamento da lista e uma ação
subsequente, tenham sido excluídos por outra aba/sessão têm o mesmo
tratamento: a ação falha, a mensagem aparece, e um `reload()` da lista
resolve o estado.

### Rota `/baralhos/:id`, em português, como o resto das rotas

`routes.jsx` já usa `/entrar`, `/cadastro`, `/diagnostico` — todas em
português. `/baralhos/:id` segue o padrão; `:id` é o `id` do baralho
(UUID), consumido via `useParams` do `react-router`.

## Risks / Trade-offs

- [`Pagination` introduzido antes de um segundo uso concreto] → aceito
  porque o mockup do produto já aponta outras telas paginadas; o
  componente é pequeno e sem estado próprio (controlado pela tela), então
  o custo de existir sem um segundo consumidor imediato é baixo.
- [Confirmação de exclusão inline em vez de modal] → aceito; se um terceiro
  fluxo de confirmação aparecer (ex.: excluir a própria conta, se isso
  vier a ganhar tela), vale reconsiderar um componente dedicado.
- [Sem cache entre lista e detalhe] → aceito porque as duas telas nunca
  ficam montadas ao mesmo tempo (rotas diferentes) — reabrir a lista
  depois de sair do detalhe já dispara uma busca nova, sempre atual.

## Migration Plan

Só telas e chamadas novas; nenhuma mudança de contrato com o backend, nenhuma
migração de dados. Reversão: `git revert` do commit, ou remover a rota e
devolver `HomePage` ao placeholder anterior.
