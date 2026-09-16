## Why

O backend já expõe baralhos e cards (`mem-words-backend`, mudança
`add-decks-and-cards`, mergeada) — CRUD completo, autenticado, com posse
verificada por usuário. O frontend ainda não tem tela nenhuma para isso: a
tela inicial da área autenticada é um placeholder ("Sua conta está pronta.
As telas de estudo entram aqui nas próximas mudanças."). Sem essa tela, a
funcionalidade do backend é inacessível a quem usa o app.

## What Changes

- A tela inicial da área autenticada (hoje um placeholder em `HomePage`)
  passa a ser a lista dos baralhos do usuário, com a ação de criar um novo
  baralho (nome, idioma de origem, idioma de destino).
- Nova tela de detalhe de um baralho, em rota própria (`/baralhos/:id`):
  lista os cards do baralho (paginados), permite criar um card (palavra e
  tradução obrigatórias; classe gramatical, sinônimos, frase de exemplo,
  tradução da frase e anotação pessoal opcionais), editar e excluir cards,
  e editar/excluir o próprio baralho.
- Novos módulos `src/api/decks.js` e `src/api/cards.js`, reaproveitando o
  cliente HTTP único (`src/api/client.js`, `auth: true`) — sem cliente HTTP
  novo, sem dependência nova.
- Um baralho ou card que pertence a outro usuário (`403`) ou não existe mais
  (`404`) é tratado como as demais recusas do backend já são: por
  `ApiError`, sem tela dedicada a cada código.

## Capabilities

### New Capabilities

- `decks/screens`: as telas de lista de baralhos e de detalhe de um
  baralho — campos, validação no cliente, paginação, estados de carregamento
  e erro, e o que cada uma garante a quem navega por teclado ou usa leitor
  de tela.

### Modified Capabilities

(nenhuma — a rota nova é uma instância do que `navigation/routing` já
descreve para rotas protegidas; nenhum requisito daquela spec muda)

## Impact

- `src/pages/HomePage.jsx` (e `HomePage.css`): conteúdo trocado do
  placeholder para a lista de baralhos.
- `src/pages/`: nova tela `DeckDetailPage.jsx` (+ CSS).
- `src/api/decks.js`, `src/api/cards.js`: novos módulos de chamada ao
  backend.
- `src/routes.jsx`: nova rota protegida `/baralhos/:id`.
- `src/components/ui/`: reaproveitados sem mudança (`Card`, `Button`,
  `Input`, `Alert`, `Badge`, `Spinner`); nenhum componente novo é esperado,
  mas um de paginação simples pode nascer aqui se nada existente servir.
- Nenhuma dependência nova; nenhuma mudança no backend.
