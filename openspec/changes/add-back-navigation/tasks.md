## 1. Marca como link para a tela inicial

- [ ] 1.1 Em `src/components/AuthenticatedLayout.jsx`, trocar o `<p
      className="shell__brand">` por `<Link to="/" className="shell__brand">`.
- [ ] 1.2 Em `AuthenticatedLayout.css`, `.shell__brand` ganha `color:
      inherit` e `text-decoration: none` (hoje só estiliza um `<p>`, sem
      reset de link).

## 2. Detalhe do baralho

- [ ] 2.1 Em `src/pages/DeckDetailPage.jsx`, adicionar um link "←
      Baralhos" para `/`, visível também no estado carregado com sucesso
      (hoje só aparece no estado indisponível).

## 3. Sessão de revisão

- [ ] 3.1 Em `src/pages/ReviewSessionPage.jsx`, adicionar a ação
      "Encerrar" (link para `/baralhos/:id`) na `Card` exibida durante a
      revisão ativa (`actions` do cabeçalho), ao lado do título "Revisão —
      X de Y".

## 4. Verificação de build e lint

- [ ] 4.1 `npm run build` sem erro.
- [ ] 4.2 `npm run lint` sem aviso.

## 5. Verificação manual ponta a ponta

- [ ] 5.1 Contra o backend local: da lista de baralhos, abrir um baralho e
      clicar na marca "mem-words" volta à lista; do detalhe de um baralho
      com cards, clicar em "← Baralhos" volta à lista; de uma sessão de
      revisão ativa (card exibido, revelado ou não), clicar em "Encerrar"
      volta ao detalhe do baralho correto, sem terminar a sessão do lado
      do backend (os cards ainda não revisados continuam prontos).
- [ ] 5.2 Confirmar visualmente os três pontos novos nos dois temas
      (claro/escuro) — sem regressão.

## 6. Verificação final

- [ ] 6.1 `openspec validate --specs` passa para `navigation/routing`,
      `decks/screens` e `decks/review-screen`.
