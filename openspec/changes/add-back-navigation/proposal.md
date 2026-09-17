## Why

Hoje, avançar de tela em tela (baralhos → detalhe do baralho → revisão) só
tem caminho de ida: a marca "mem-words" no cabeçalho não é um link, o
detalhe do baralho só oferece "Voltar para os baralhos" quando o baralho
está indisponível (nunca durante o uso normal), e a sessão de revisão só
oferece um caminho de volta quando termina, está vazia, ou falha — nunca
enquanto está em andamento. Quem quer voltar um nível sem usar o botão
voltar do navegador (ou que abriu a tela numa aba nova, sem histórico) fica
sem saída dentro da aplicação.

## What Changes

- A marca "mem-words" no cabeçalho da área autenticada passa a ser um link
  para a tela inicial, alcançável de qualquer tela protegida.
- A tela de detalhe do baralho ganha um link "← Baralhos" sempre visível,
  não só quando o baralho está indisponível.
- A tela de sessão de revisão ganha uma ação "Encerrar" sempre visível,
  levando ao detalhe do baralho — hoje esse caminho só existe nos estados
  de fila vazia, sessão concluída ou erro.

## Impact

**Código afetado**

- `src/components/AuthenticatedLayout.jsx`/`.css` — marca vira `Link`.
- `src/pages/DeckDetailPage.jsx` — link fixo de volta à lista.
- `src/pages/ReviewSessionPage.jsx` — ação "Encerrar" fixa.

**Specs afetadas**

- `navigation/routing`: novo requisito de caminho para a tela inicial
  alcançável de qualquer tela protegida.
- `decks/screens`: novo requisito de caminho de volta sempre visível na
  tela de detalhe.
- `decks/review-screen`: os requisitos que já previam "caminho de volta"
  apenas nos estados de fila vazia/sessão concluída/erro passam a valer
  também durante uma sessão em andamento.

Sem mudança de rota, sem novo componente (reaproveita `Link` e as classes
`ms-button` já existentes).
