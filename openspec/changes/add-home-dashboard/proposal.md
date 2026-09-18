## Why

A tela inicial hoje só lista os baralhos — quem abre o app não sabe, sem
clicar em cada um, quanto tem para revisar agora nem se manteve o hábito
diário. O mockup do produto propõe uma tela de painel: saudação, sequência
de dias seguidos, um resumo "revisão de hoje" (quantos cards, divididos em
novos/aprendendo/revisão, tempo estimado) com atalho para começar a
revisar ou adicionar uma palavra, e a lista de baralhos logo abaixo, mais
compacta.

O backend (`mem-words-backend`, change `add-home-dashboard-summary`) já
expõe o que faltava: `GET /reviews/today` (agregado entre baralhos, por
tipo) e `currentStreak` em `GET /users/me`.

## What Changes

- `HomePage` passa a abrir com uma saudação (nome + período do dia) e,
  quando há sequência ativa, um selo "N dias seguidos".
- Novo cartão "Revisão de hoje": total de cards prontos agora, dividido em
  três selos (novos/aprendendo/revisão), uma barra de composição (mesmas
  cores dos selos) e o tempo estimado da sessão. Duas ações: "Começar
  revisão" (vai para o baralho, entre os prontos, com mais prioridade) e
  "Adicionar palavra" (escolhe o baralho quando há mais de um, e vai para
  o formulário já existente na tela de detalhe).
- A lista de baralhos ganha o título "Meus baralhos" e passa de grade de
  cartões para linhas compactas (nome, idiomas/contagem, selo de prontos
  ou "em dia", ação "Revisar") — a barra de maturidade de cada baralho sai
  daqui; ela já existe (ou vai existir, no change
  `improve-deck-detail-screen`) na tela de detalhe.
- Criar baralho continua do mesmo jeito, só realocado sob "Meus baralhos".

## Capabilities

### Modified Capabilities

- `decks/screens`: a tela inicial ganha saudação, sequência de dias,
  resumo "revisão de hoje" com as duas ações rápidas, e a lista de
  baralhos passa a linhas compactas sem a barra de maturidade.

## Impact

- `src/api/reviews.js`: nova `getTodaySummary()`, chamando
  `GET /reviews/today`.
- `src/pages/HomePage.jsx`/`.css`: reescrita — saudação, sequência,
  cartão de revisão de hoje (com o seletor de baralho para "adicionar
  palavra"), lista de baralhos em linhas.
- Depende de `add-home-dashboard-summary` já implementado no backend
  (`mem-words-backend`) — sem ele, `GET /reviews/today` não existe (404) e
  `currentStreak` vem `undefined`; a tela degrada (cartão de revisão de
  hoje mostra estado de erro, sequência não aparece), sem quebrar o resto
  da página.
