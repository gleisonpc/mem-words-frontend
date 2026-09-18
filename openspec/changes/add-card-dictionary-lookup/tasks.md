## 1. Extrair campos e validação de card para módulo compartilhado

- [ ] 1.1 Criar `src/pages/cardForm.js` com `requiredText`, `optionalText`, `synonymsToText`, `textToSynonyms`, `cardValidate`, `cardInputFromValues`, `EMPTY_CARD_VALUES`, `describeApiError` e o componente `CardFields`, movidos de `DeckDetailPage.jsx` sem mudar comportamento
- [ ] 1.2 Atualizar `DeckDetailPage.jsx` para importar de `cardForm.js` em vez de definir localmente, e remover `CreateCardForm` e o estado `createFormKey`
- [ ] 1.3 Rodar `npm run lint` e confirmar que `DeckDetailPage.jsx` (edição de card) continua funcionando sem regressão

## 2. Cliente de dicionário/tradução

- [ ] 2.1 Criar `src/api/dictionaryLookup.js` com a tabela de idiomas reconhecidos (texto comum em português/inglês → código) e uma função `resolveLanguagePair(sourceLanguage, targetLanguage)` que devolve os códigos ou `null` quando não reconhecido
- [ ] 2.2 Implementar `fetchSuggestion({ word, sourceLanguage, targetLanguage })`: dispara Wiktionary (definição/exemplo em inglês), Datamuse (sinônimos) e MyMemory (tradução) em paralelo via `Promise.allSettled`, com tempo limite próprio (4s) por chamada; nunca lança — devolve `{ translation, exampleSentence, synonyms }` só com as partes obtidas, ou `null` quando nenhuma
- [ ] 2.3 Verificar manualmente (console do dev server) que uma palavra em inglês comum devolve sugestão, e que uma falha simulada (ex. desligar a rede) não lança exceção

## 3. Tela de criação de card

- [ ] 3.1 Criar `src/pages/AddCardPage.jsx` e `.css`: carrega o baralho da URL (mesmo padrão de `loadDeck` em `DeckDetailPage.jsx`, incluindo estado de indisponível) e a lista de baralhos via `listDecks()` para o campo de baralho
- [ ] 3.2 Formulário com os campos de `CardFields` (de `cardForm.js`) mais o campo "Baralho" (`<select>`, pré-selecionado com o baralho da URL), layout em pares (Palavra/Tradução, Sinônimos/Baralho) como no mockup
- [ ] 3.3 Ações "Salvar" (cria e navega para `/baralhos/<baralho escolhido>`) e "Salvar e criar outra" (cria e limpa o formulário, permanecendo na tela)
- [ ] 3.4 Link de volta para a tela de detalhe do baralho da URL, visível em qualquer estado da tela (mesmo padrão do requirement já existente para a tela de detalhe)

## 4. Sugestão automática na tela de criação

- [ ] 4.1 No `onBlur` do campo Palavra, se o par de idiomas do baralho escolhido no `<select>` for reconhecido (`resolveLanguagePair`), chamar `fetchSuggestion`; ignorar chamadas cuja palavra não corresponda mais ao valor atual do campo ao responder (evita sugestão desatualizada de uma palavra já trocada)
- [ ] 4.2 Exibir a sugestão obtida em um `Alert` variant="info" com "Usar sugestão"/"Descartar", como no mockup; nenhuma chamada nem caixa quando o par não é reconhecido
- [ ] 4.3 "Usar sugestão" sobrescreve tradução/frase de exemplo/sinônimos com os valores obtidos e some com a caixa; "Descartar" só some com a caixa
- [ ] 4.4 Trocar o baralho no `<select>` ou a palavra descarta qualquer sugestão exibida (não deixa uma sugestão da palavra/baralho anterior aplicável ao estado atual)
- [ ] 4.5 Verificar visualmente: baralho inglês→português com palavra comum mostra sugestão aplicável; baralho com idioma não reconhecido não mostra nada; interromper a rede durante a busca não gera erro visível

## 5. Rota e navegação a partir da tela de detalhe

- [ ] 5.1 Registrar `/baralhos/:id/cards/novo` em `src/routes.jsx`, no mesmo grupo de `/baralhos/:id/revisar`
- [ ] 5.2 Em `DeckDetailPage.jsx`, substituir a renderização de `CreateCardForm` por uma ação (link/botão) para `/baralhos/:id/cards/novo`
- [ ] 5.3 Verificar visualmente: criar um card pela tela nova faz o card aparecer na lista da tela de detalhe ao voltar, sem recarregar a página manualmente

## 6. Verificação final

- [ ] 6.1 Rodar `npm run lint` e confirmar que passa sem erros
- [ ] 6.2 Rodar `npm run build` e confirmar que o build de produção passa sem erros
- [ ] 6.3 Testar manualmente no dev server: criar card com e sem sugestão aplicada, trocar de baralho no formulário, "salvar e criar outra", e os estados de baralho indisponível/carregando na tela nova
