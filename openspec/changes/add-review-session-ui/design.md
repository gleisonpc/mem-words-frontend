## Context

Ver `proposal.md` para motivação. O backend (`mem-words-backend`, mudança
`add-review-scheduling`) já expõe:

- `GET /decks/:id/reviews/queue` → `{ queue: [{ card, previews }] }`, onde
  `card` é o card completo (mesmo formato de `GET /cards/:id`, já com
  `state`, `dueAt`, etc.) e `previews` é `[{ grade, dueAt }]` para as
  quatro notas (`again`/`hard`/`good`/`easy`), calculadas a partir do
  estado atual — sem gravar nada. A fila já vem ordenada
  (`learning` > `review` > `new`).
- `POST /cards/:id/reviews` com `{ grade }` → card atualizado.

O frontend já tem, e este change reaproveita sem mudar: `src/api/client.js`
(`request`), `ApiError`, os componentes base (`Button`, `Card`, `Alert`,
`Badge`, `Spinner`), e o padrão de busca de dados em estado local por tela
(`useState`/`useEffect`/`useCallback`, sem hook genérico) já usado em
`HomePage`/`DeckDetailPage`.

## Goals / Non-Goals

**Goals:**
- Percorrer a fila de revisão de um baralho, um card por vez, com a
  prévia de cada nota visível antes de escolher.
- Iniciar uma revisão a partir da tela de detalhe do baralho, sabendo
  quantos cards estão prontos antes de entrar.

**Non-Goals:**
- Estatísticas, sequência de dias (streak) ou histórico de sessões — o
  backend não persiste histórico de revisão nesta base (ver design.md do
  change `add-review-scheduling`).
- Atalhos de teclado para as notas (`1`/`2`/`3`/`4`, espaço para revelar)
  — desejável para quem revisa muitos cards, mas não essencial para a
  primeira versão da tela; os botões continuam alcançáveis por Tab/Enter
  como qualquer outro botão da aplicação (requisito já geral do design
  system).
- Atualizar a fila em tempo real se um card for criado/editado/excluído em
  outra aba durante a sessão — a fila é buscada uma vez, no início da
  sessão; o cenário de edição concorrente entre abas já não é tratado em
  nenhuma outra tela do app.

## Decisions

### Fila buscada uma vez, sessão percorrida em memória

`GET /decks/:id/reviews/queue` é chamado uma única vez, ao entrar na tela.
A partir daí, um índice local (`useState`) percorre o array já recebido —
cada nota registrada (`POST /cards/:id/reviews`) avança o índice, sem
buscar a fila de novo. Alternativa descartada: rebuscar a fila a cada nota
— mais correto se outra aba mudasse o baralho no meio da sessão (non-goal
acima), mas adicionaria uma latência por card sem benefício para o caso
comum (uma sessão em uma aba só).

Consequência aceita: se registrar uma nota falhar (rede), o card
continua no índice atual — tentar de novo não perde o lugar na fila. Se
suceder, o índice avança independentemente de qual nota foi escolhida; a
fila em si nunca é reordenada no cliente.

### Prévia formatada no cliente, a partir do `dueAt` cru

O backend devolve timestamps, não texto pronto (decisão já tomada do lado
dele: formatar é decisão de apresentação). Uma função pura,
`formatDueIn(dueAt, now)`, decide entre minutos (`"em 6 min"`), dias
(`"em 3 dias"`) ou `"agora"` (diferença ao redor de zero, caso de borda de
arredondamento) — só o suficiente para rotular os quatro botões de nota;
não é um formatador de datas genérico.

### Revelar antes de notar

A palavra aparece sozinha; um botão "Revelar" mostra tradução e os demais
campos (classe gramatical, sinônimos, frase de exemplo, anotação) e, só
então, os quatro botões de nota aparecem. Notar sem ter revelado não faz
sentido no domínio (a nota descreve o quão bem a pessoa lembrou, e ela só
sabe isso depois de conferir a tradução) — a tela nem oferece os botões de
nota antes da revelação, em vez de desabilitá-los.

### Ação de revisar na tela de detalhe mostra a contagem, não só um link

A tela de detalhe já busca o baralho (`GET /decks/:id`) e os cards
paginados; para saber quantos cards estão prontos, ela busca a fila
(`GET /decks/:id/reviews/queue`) à parte e usa só `queue.length` — o
mesmo endpoint que a tela de revisão usa, chamado de novo (a fila é curta
o bastante para não pesar, e as duas telas não compartilham estado). Sem
essa contagem, o botão "Revisar" existiria mas a pessoa não saberia se há
algo para fazer antes de clicar.

### Sessão vazia é o mesmo componente que sessão terminada

Se a fila já chega vazia (nenhum card pronto) ou o índice passa do
último card, a tela mostra a mesma mensagem de conclusão com o caminho de
volta ao baralho — não há um segundo estado "nada para revisar" distinto
de "terminou a revisão".

## Risks / Trade-offs

- [Fila buscada uma vez] → aceito; ver Non-Goals acima. Reabrir a tela de
  revisão sempre busca a fila de novo, então o pior caso é "esta sessão
  específica" ficar levemente desatualizada, nunca a aplicação como um
  todo.
- [Contagem de "prontos" busca a fila inteira só para contar] → aceito; o
  volume por baralho é baixo (mesma premissa já usada para a paginação de
  cards) e não há endpoint de contagem isolado no backend — pedir um só
  para isto seria uma mudança de backend para economizar uma consulta
  pequena.

## Migration Plan

Só telas e chamadas novas; nenhuma mudança de contrato com o backend,
nenhuma migração de dados. Reversão: `git revert` do commit, ou remover a
rota e o botão de revisão da tela de detalhe.
