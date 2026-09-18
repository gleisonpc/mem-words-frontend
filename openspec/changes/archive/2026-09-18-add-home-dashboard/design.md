## Context

Ver `proposal.md`. Depende de `add-home-dashboard-summary`
(mem-words-backend), que expõe:

- `GET /reviews/today` → `{ today: { dueCount, newCount, learningCount,
  reviewCount } }`, agregado entre todos os baralhos do usuário, cards
  prontos para revisão agora.
- `GET /users/me` → `currentStreak` (dias seguidos com ao menos uma nota
  registrada; `0` quando nunca revisou ou a sequência quebrou).

`GET /decks` continua devolvendo, por baralho, `cardCount`/`dueCount`/
`newCount`/`learningCount`/`matureCount`/`suspendedCount` — usados para a
lista de baralhos, mas não para o resumo "revisão de hoje": `learningCount`
ali não é filtrado por `dueAt`, e não existe `reviewCount` de baralho
nenhum (só `matureCount`, uma métrica diferente). Por isso a tela faz duas
buscas independentes ao montar: `listDecks()` (já existente) e a nova
`getTodaySummary()`.

O frontend já tem, e este change reaproveita sem mudar: `Badge` (variantes
`info`/`warning`/`neutral` — exatamente as cores de novos/aprendendo/
revisão do mockup), `Card`, `Button`, `Spinner`, `Alert`, `useAuth()` (para
nome e `currentStreak` do usuário logado), e o padrão de estado local por
tela já usado em `HomePage.jsx`/`DeckDetailPage.jsx`.

## Goals / Non-Goals

**Goals:**
- Resumo do dia visível assim que a tela abre, sem clique adicional.
- "Começar revisão" e "Adicionar palavra" utilizáveis em um clique quando
  não há ambiguidade (respectivamente: existe baralho com prontos; existe
  só um baralho).
- Nenhuma regra de negócio nova duplicada no cliente — os três selos vêm
  prontos de `GET /reviews/today`.

**Non-Goals:**
- Sessão de revisão que atravessa vários baralhos num fluxo só —
  "Começar revisão" manda para a tela de revisão de um baralho (já
  existente), a que tiver mais prioridade entre os com cards prontos, não
  uma fila unificada.
- Progresso "quanto já revisei hoje" dentro da barra de composição —
  nenhum histórico de revisões é persistido pelo backend (ver README do
  backend); a barra mostra a composição do que está pronto agora
  (novos/aprendendo/revisão), não um andamento.
- Uma tela "ver todos os baralhos" separada — a lista completa continua
  na própria tela inicial, como hoje.
- Maior sequência já alcançada, ou qualquer histórico de streak além do
  contador corrente — o backend não guarda isso.

## Decisions

### Duas buscas independentes ao montar a tela, cada uma com seu próprio estado

`listDecks()` (existente) e `getTodaySummary()` (nova) partem juntas no
mesmo `useEffect` inicial, mas cada uma com seu `status`
(`loading`/`ok`/`error`) — o cartão "Revisão de hoje" pode falhar (por
exemplo, backend antigo sem `GET /reviews/today`, ver Risks) sem impedir
a lista de baralhos de aparecer, e vice-versa. Alternativa descartada: um
único `status` para a tela inteira. Rejeitada porque uma falha isolada de
um dos dois--sobretudo `GET /reviews/today`, o mais novo e o mais
provável de ainda não existir num backend não atualizado--esconderia a
lista de baralhos, que continua funcionando.

### Saudação e sequência calculadas no cliente, sem chamada própria

`saudacao(now)` (local, pura): "Bom dia"/"Boa tarde"/"Boa noite" a partir
de `now.getHours()` (cortes em 12h e 18h, sem configuração). O nome usa só
o primeiro nome (`user.name.split(' ')[0]`), mesmo padrão informal do
mockup. A sequência (`user.currentStreak`) só aparece como selo quando
maior que `0` — um usuário sem sequência ainda não vê "`0` dias seguidos",
que não comunicaria nada de útil.

### Barra de composição: componente novo local, não uma variante de `ProgressBar`

`ProgressBar` (design system) só pinta um segmento. O mockup pede três
segmentos coloridos (novos/aprendendo/revisão) somando o total pronto.
Alternativa descartada: estender `ProgressBar` para aceitar segmentos.
Rejeitada pelo mesmo raciocínio já registrado no design.md de
`improve-deck-detail-screen` para `StatTile` — um único consumidor até
agora não justifica generalizar um componente do design system; melhor um
componente pequeno e local (`DueComposition`, em `HomePage.jsx`) que só
desenha três `div`s proporcionais ao total, usando as mesmas variáveis de
cor dos `Badge`s (`--color-info`/`--color-warning`/`--color-text-muted`)
para consistência visual sem duplicar a paleta.

### Tempo estimado: heurística fixa de 20s por card, sem nova chamada

`Math.max(1, Math.round((dueCount * 20) / 60))` minutos — mesma conta que
o mockup usa (24 cards ≈ 8 min). Não é uma medição real de tempo de
resposta do usuário (o backend não guarda isso), é só uma expectativa
grosseira para a pessoa dimensionar a sessão antes de começar, mesmo
espírito de estimativas de leitura ("5 min de leitura") comuns em outros
produtos. Ajustável depois sem migração — é uma constante do cliente.

### "Começar revisão" escolhe o baralho com prioridade, sem pedir confirmação

Entre os baralhos com `dueCount > 0` (já carregados por `listDecks()`),
vai para o primeiro respeitando a mesma prioridade da fila de revisão de
cada baralho: `learning` antes de `review`, antes de `new` (ver reviews
spec do backend) — como o frontend não sabe a composição por baralho sem
uma chamada extra por baralho, a prioridade usada aqui é mais simples:
o primeiro baralho, na ordem devolvida por `GET /decks` (mais antigo
primeiro), que tenha `dueCount > 0`. Alternativa descartada: escolher o
baralho com mais cards prontos. Rejeitada por não ser obviamente melhor
(um baralho pequeno com cards atrasados há mais tempo pode ser mais
urgente que um grande) e por exigir uma regra nova sem apoio do backend;
a ordem de criação é previsível e já é a ordem em que os baralhos
aparecem na lista.

Sem nenhum baralho com `dueCount > 0`, o botão fica desabilitado — não há
para onde mandar o clique.

### "Adicionar palavra" decide o baralho antes de navegar

- Nenhum baralho → ação escondida (o cartão de revisão de hoje também não
  faz sentido sem baralho nenhum; a tela mostra só o estado vazio já
  existente, convidando a criar o primeiro).
- Um baralho → navega direto para `/baralhos/:id`, onde o formulário de
  criação de card já fica sempre visível (não é preciso reabrir nada).
- Mais de um baralho → um seletor compacto (lista dos nomes dos baralhos,
  local a `HomePage.jsx`) aparece perto do botão; escolher um navega para
  `/baralhos/:id`. Alternativa descartada: um formulário de card completo
  direto na tela inicial, com um `<select>` de baralho. Rejeitada porque
  duplicaria o formulário inteiro de `CreateCardForm` (sete campos) só
  para adicionar um seletor de baralho na frente — a tela de detalhe já
  resolve isso, e navegar para lá é um clique a mais só quando há
  ambiguidade sobre qual baralho.

### Lista de baralhos: linhas compactas, sem a barra de maturidade

Nome, "N cards · origem → destino" e, à direita, o selo de prontos (ou
"em dia") com a ação "Revisar" — mesma informação de hoje, menos a barra
de progresso de maturidade, que sai da tela inicial. Ela deixa de fazer
sentido aqui porque a tela inicial passa a abrir com o resumo "revisão de
hoje", que é a pergunta que a maturidade tentava responder de relance
("quanto falta"); o detalhe por baralho (incluindo maturidade) continua
disponível na tela de detalhe — hoje via a barra que já existe lá, e, com
`improve-deck-detail-screen`, também via os quatro blocos de contagem.

## Risks / Trade-offs

- [Este change não funciona sozinho] → aceito e documentado, mesmo padrão
  já registrado em `improve-deck-detail-screen`: sem
  `add-home-dashboard-summary` mesclado no backend, `GET /reviews/today`
  responde `404` e `currentStreak` vem `undefined`. A tela degrada: o
  cartão de revisão de hoje mostra o estado de erro (mesmo componente
  `Alert` já usado nos outros erros da tela), a saudação aparece sem selo
  de sequência, e a lista de baralhos continua funcionando normalmente —
  a ordem de deploy importa (backend primeiro), mas nada quebra.
- [Heurística de 20s/card não reflete o card real] → aceito; é uma
  expectativa, não uma medição, e ajustável sem migração.

## Migration Plan

Reversível por `git revert`, sem dado de conta a migrar.
