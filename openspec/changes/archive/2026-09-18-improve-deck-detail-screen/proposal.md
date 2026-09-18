## Why

O mockup atual do produto mostra a tela de detalhe de um baralho com muito
mais informação do que a implementação hoje: quantos cards estão novos,
aprendendo, maduros e suspensos, um jeito de buscar uma palavra específica
entre os cards, o estado de cada card (incluindo quando está "difícil") e
uma ação para suspendê-lo. Nada disso existe na tela atual, que só lista
os cards com palavra/tradução e um formulário de edição por item.

O change `add-card-suspension-and-difficulty` no backend
(`mem-words-backend`) já expõe o que falta: `status` calculado por card,
contagens por status no baralho (`newCount`/`learningCount`/
`matureCount`/`suspendedCount`), busca (`q`) e filtro (`status`) na
listagem de cards, e os endpoints `POST /cards/:id/suspend`/`unsuspend`.

## What Changes

- A tela de detalhe do baralho ganha um resumo de quatro blocos — Novos,
  Aprendendo, Maduros, Suspensos — usando as contagens agora devolvidas
  por `GET /decks/:id`.
- A lista de cards ganha uma busca por palavra e um filtro por status,
  enviados como `q`/`status` para `GET /decks/:id/cards`, mantendo a
  paginação já existente.
- Cada card na lista mostra um selo do seu `status` (novo, aprendendo,
  difícil, maduro, em revisão, suspenso) e, quando aplicável, a data da
  próxima revisão (`dueAt`).
- Cada card ganha a ação de suspender/reativar, ao lado das já existentes
  (editar, excluir) — o lugar pedido para "colocar esse status na
  palavra": o próprio badge de status já mostra "suspenso" quando
  aplicável, e a ação fica junto dos outros botões do card.
- O cabeçalho do baralho passa a exibir "N cards · origem → destino ·
  criado em `<mês>`" em vez da lista de definição atual, aproximando do
  mockup.

## Capabilities

### Modified Capabilities

- `decks/screens`: tela de detalhe do baralho ganha os blocos de
  contagem por status, busca, filtro, selo de status por card, coluna de
  próxima revisão e ação de suspender/reativar.

## Impact

- `src/api/decks.js`: nenhuma mudança de assinatura — `getDeck` já
  repassa o corpo inteiro da resposta, que passa a incluir as contagens
  novas.
- `src/api/cards.js`: `listCards` ganha `q`/`status` opcionais.
- Novo: `suspendCard`/`unsuspendCard` em `src/api/cards.js`, chamando
  `POST /cards/:id/suspend`/`unsuspend`.
- `src/pages/DeckDetailPage.jsx` e `.css`: blocos de contagem, busca,
  filtro, coluna de estado/próxima revisão, ação de suspender.
- `src/components/ui/Badge.jsx`: reaproveitado sem mudança — mapeamento
  de `status` para variante de selo fica na tela, não no componente.
- Depende de `add-card-suspension-and-difficulty` já implementado no
  backend (`mem-words-backend`) — sem ele, `status`/contagens novas/
  `q`/`status` na listagem/endpoints de suspensão não existem.
