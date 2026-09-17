## 1. Cabeçalho e grade

- [ ] 1.1 Em `src/pages/HomePage.jsx`, trocar o `<Card title="Seus
      baralhos">` por um cabeçalho de página ("Baralhos" + botão "Novo
      baralho" à direita), fora de qualquer cartão.
- [ ] 1.2 Trocar a lista (`<ul className="home__decks">`) por uma grade
      responsiva de cartões (mesmo padrão de `repeat(auto-fit, minmax(...,
      1fr))` já usado em `Gallery.css`).

## 2. Cartão de baralho

- [ ] 2.1 Cada cartão exibe nome, selo (`Badge`) e "N cards · origem →
      destino".
- [ ] 2.2 Selo usa variante `warning` com "N hoje" quando `dueCount > 0`,
      e variante `success` com "em dia" quando `dueCount === 0` — usando
      `?? 0` para tolerar um backend antigo sem os campos novos.
- [ ] 2.3 Com `cardCount > 0`, exibir `ProgressBar` (sem `label`/`showValue`)
      com `value={matureCount}` e `max={cardCount}`, seguida de um
      parágrafo "N% maduros" calculado localmente. Com `cardCount === 0`,
      exibir "Sem cards ainda" no lugar.

## 3. Criação sob demanda

- [ ] 3.1 Adicionar o estado `creating`; o botão "Novo baralho" do
      cabeçalho o ativa.
- [ ] 3.2 Adicionar um cartão tracejado "Criar baralho" ao final da
      grade, que também ativa `creating`.
- [ ] 3.3 `CreateDeckForm` só é renderizado quando `creating` é
      verdadeiro, ganha um botão "Cancelar" que desativa `creating` sem
      enviar nada, e desativa `creating` automaticamente ao criar com
      sucesso.
- [ ] 3.4 Um baralho recém-criado entra na lista em memória com
      `cardCount`, `dueCount` e `matureCount` todos `0` — sem nova ida ao
      backend só para confirmar o óbvio.

## 4. Verificação de build e lint

- [ ] 4.1 `npm run build` sem erro.
- [ ] 4.2 `npm run lint` sem aviso.

## 5. Verificação manual ponta a ponta

- [ ] 5.1 Contra o backend local (com `add-deck-list-stats` aplicado):
      baralho sem cards mostra "em dia" e "Sem cards ainda"; baralho com
      cards prontos mostra o selo de contagem correto; um baralho levado
      a ter cards maduros mostra a barra e a porcentagem corretas;
      "Novo baralho" e o cartão tracejado revelam o mesmo formulário;
      cancelar oculta sem requisição; criar com sucesso adiciona o
      baralho à grade já com os selos corretos (zerados) e oculta o
      formulário.
- [ ] 5.2 Confirmar visualmente a tela nos dois temas (claro/escuro) —
      sem regressão, incluindo o estado sem nenhum baralho.

## 6. Verificação final

- [ ] 6.1 `openspec validate --specs` passa para `decks/screens`.
