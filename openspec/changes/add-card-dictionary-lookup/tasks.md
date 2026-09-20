## 1. Extrair campos e validação de card para módulo compartilhado

- [x] 1.1 Criar `src/pages/cardForm.jsx` com `requiredText`, `optionalText`, `synonymsToText`, `textToSynonyms`, `cardValidate`, `cardInputFromValues`, `EMPTY_CARD_VALUES`, `describeApiError` e o componente `CardFields`, movidos de `DeckDetailPage.jsx` sem mudar comportamento (`.jsx`, não `.js` — este build falha em JSX dentro de `.js`, ver `npm run build`)
- [x] 1.2 Atualizar `DeckDetailPage.jsx` para importar de `cardForm.jsx` em vez de definir localmente, e remover `CreateCardForm` e o estado `createFormKey`
- [x] 1.3 Rodar `npm run lint` e confirmar que `DeckDetailPage.jsx` (edição de card) continua funcionando sem regressão

## 2. Cliente de dicionário/tradução

- [x] 2.1 Criar `src/api/dictionaryLookup.js` com a tabela de idiomas reconhecidos (texto comum em português/inglês → código) e uma função `resolveLanguagePair(sourceLanguage, targetLanguage)` que devolve os códigos ou `null` quando não reconhecido
- [x] 2.2 Implementar `fetchSuggestion({ word, sourceLanguage, targetLanguage })`: dispara Wiktionary (definição/exemplo em inglês), Datamuse (sinônimos) e MyMemory (tradução) em paralelo via `Promise.allSettled`, com tempo limite próprio (4s) por chamada; nunca lança — devolve `{ translation, exampleSentence, synonyms }` só com as partes obtidas, ou `null` quando nenhuma
- [x] 2.3 Verificado com um script Node isolado (não o console do dev server, indisponível nesta sessão — sem navegador anexado): `fetchSuggestion` para "overwhelm" (Inglês→Português) devolveu tradução, frase de exemplo e sinônimos reais dos três serviços; com o host reescrito para um domínio inexistente, devolveu `null` sem lançar exceção

## 3. Tela de criação de card

- [x] 3.1 Criar `src/pages/AddCardPage.jsx` e `.css`: carrega o baralho da URL (mesmo padrão de `loadDeck` em `DeckDetailPage.jsx`, incluindo estado de indisponível) e a lista de baralhos via `listDecks()` para o campo de baralho
- [x] 3.2 Formulário com os campos de `CardFields` (de `cardForm.jsx`) mais o campo "Baralho" (`<select>`, pré-selecionado com o baralho da URL), layout em pares (Palavra/Tradução, Sinônimos/Baralho) como no mockup
- [x] 3.3 Ações "Salvar" (cria e navega para `/baralhos/<baralho escolhido>`) e "Salvar e criar outra" (cria e limpa o formulário, permanecendo na tela)
- [x] 3.4 Link de volta para a tela de detalhe do baralho da URL, visível em qualquer estado da tela (mesmo padrão do requirement já existente para a tela de detalhe)

## 4. Sugestão automática na tela de criação

- [x] 4.1 No `onBlur` do campo Palavra, se o par de idiomas do baralho escolhido no `<select>` for reconhecido (`resolveLanguagePair`), chamar `fetchSuggestion`; ignorar chamadas cuja palavra não corresponda mais ao valor atual do campo ao responder (evita sugestão desatualizada de uma palavra já trocada)
- [x] 4.2 Exibir a sugestão obtida em um `Alert` variant="info" com "Usar sugestão"/"Descartar", como no mockup; nenhuma chamada nem caixa quando o par não é reconhecido
- [x] 4.3 "Usar sugestão" sobrescreve tradução/frase de exemplo/sinônimos com os valores obtidos e some com a caixa; "Descartar" só some com a caixa
- [x] 4.4 Trocar o baralho no `<select>` ou a palavra descarta qualquer sugestão exibida (não deixa uma sugestão da palavra/baralho anterior aplicável ao estado atual)
- [x] 4.5 Verificado num backend local real (Postgres + `mem-words-backend` rodando nesta sessão) via Chromium/Playwright: baralho Inglês→Português com "overwhelm" mostrou sugestão (frase de exemplo e sinônimos reais da Wiktionary/Datamuse; a tradução da MyMemory não veio desta vez por já ter batido a cota diária do IP nos testes da task 2.3 — degradou para "sem tradução" como esperado, sem quebrar a sugestão) e "Usar sugestão" preencheu os campos certos; baralho Klingon→Português não exibiu caixa alguma; a rede não foi desligada de propósito, mas a task 2.3 já comprovou que `fetchSuggestion` não lança em falha de rede

## 5. Rota e navegação a partir da tela de detalhe

- [x] 5.1 Registrar `/baralhos/:id/cards/novo` em `src/routes.jsx`, no mesmo grupo de `/baralhos/:id/revisar`
- [x] 5.2 Em `DeckDetailPage.jsx`, substituir a renderização de `CreateCardForm` por uma ação (link/botão) para `/baralhos/:id/cards/novo`
- [x] 5.3 Verificado com o mesmo backend local: criar um card pela tela nova (e um segundo, via "salvar e criar outra") faz os dois aparecerem na lista da tela de detalhe ao voltar com "Salvar", sem recarregar a página manualmente

## 6. Verificação final

- [x] 6.1 Rodar `npm run lint` e confirmar que passa sem erros
- [x] 6.2 Rodar `npm run build` e confirmar que o build de produção passa sem erros
- [x] 6.3 Testado no dev server contra um backend local (Postgres real, migrations aplicadas): cadastro, criar baralho, criar card com sugestão aplicada e sem sugestão (par não reconhecido), "salvar e criar outra" limpando o formulário, "Salvar" voltando para o detalhe com os dois cards na lista, e os estados de baralho indisponível (id inexistente) e carregando na tela nova

## 7. Correção pós-merge: par de idiomas invertido não disparava sugestão

- [x] 7.1 Reproduzido em produção (`mem-words-frontend.vercel.app`) contra um baralho real do usuário (`sourceLanguage: "Portugues"`, `targetLanguage: "ingles"`): nenhuma requisição aos três serviços saía ao sair do campo Palavra — `resolveLanguagePair` exigia que fosse especificamente a *origem* a mapear para inglês, e baralhos reais guardam o par nos dois sentidos
- [x] 7.2 Corrigido `resolveLanguagePair` em `src/api/dictionaryLookup.js` para aceitar o par em qualquer ordem — o lado que mapeia para inglês vira `source` (usado nas buscas de definição/sinônimos), o outro vira `target` (código da tradução)
- [x] 7.3 Verificado com um script Node isolado: `resolveLanguagePair('Portugues', 'ingles')` e `resolveLanguagePair('ingles', 'Portugues')` agora devolvem o mesmo par resolvido, e `fetchSuggestion` com o par invertido do usuário devolveu tradução, frase de exemplo e sinônimos reais
- [x] 7.4 `npm run lint` e `npm run build` continuam passando sem erros

## 8. Correção pós-merge: sugestão passa a vir do backend, não do navegador

- [x] 8.1 Reescrever `src/api/dictionaryLookup.js` para chamar `GET /dictionary/suggest` (`mem-words-backend`, change `add-dictionary-suggestion-endpoint`) via `request()` de `client.js`, removendo `resolveLanguagePair`, a tabela de idiomas, e o `fetch`/`AbortController` próprios — a resolução do par e as três chamadas externas agora vivem no backend
- [x] 8.2 Em `AddCardPage.jsx`, remover o pré-check local com `resolveLanguagePair` em `handleWordBlur` — a tela sempre chama `fetchSuggestion` quando a palavra não está vazia, e o backend decide sozinho se o par é reconhecido
- [x] 8.3 Rodar `npm run lint` e `npm run build` e confirmar que passam sem erros
- [x] 8.4 Testado de ponta a ponta (Chromium/Playwright) contra o backend local com o endpoint novo, capturando toda requisição de rede: sugestão apareceu para o par invertido real ("Portugues"/"ingles", tradução/exemplo/sinônimos reais), nenhuma caixa apareceu para um par não reconhecido (Klingon/Vulcano), e a captura de rede confirmou 2 chamadas a `/dictionary/suggest` (o próprio backend) e **zero** chamadas diretas a Wiktionary/Datamuse/MyMemory

## 9. Correção pós-lançamento: busca por botão, com estado visível

- [x] 9.1 Em `cardForm.jsx`, trocar a prop `onWordBlur` de `CardFields` por `wordSearch` (slot renderizado logo após Tradução, antes de Sinônimos)
- [x] 9.2 Em `AddCardPage.jsx`, trocar a busca automática em `onBlur` por um botão "Buscar sugestão" (desabilitado com a palavra vazia), com estados `searching` (carregando) e `searchedEmpty` (busca concluída sem nada), exibindo "Buscando sugestão..." no botão e "Nenhuma sugestão encontrada para esta palavra." abaixo dele quando aplicável
- [x] 9.3 Editar a palavra ou trocar o baralho depois de uma busca concluída limpa a sugestão e a mensagem de "nada encontrado" (mesmo padrão de invalidação por `suggestionRequestId` já existente)
- [x] 9.4 Atualizar a spec delta (`specs/decks/screens/spec.md`) e `design.md` para descrever a busca por ação explícita, com estado de carregamento e mensagem de "nada encontrado", em vez da busca automática silenciosa
- [x] 9.5 Rodar `npm run lint` e `npm run build` e confirmar que passam sem erros
- [x] 9.6 Testado manualmente contra o backend local: botão desabilitado com o campo vazio, estado de carregando visível durante a busca, sugestão aplicável ao ser encontrada, mensagem de "nada encontrado" para um par não reconhecido, e o resultado anterior some ao editar a palavra ou trocar o baralho

## 10. Correção pós-lançamento: tradução da frase e classe gramatical não chegavam à tela

- [x] 10.1 Reproduzido: `add-dictionary-suggestion-endpoint` já devolve `exampleTranslation` e `partOfSpeech` (correção pós-lançamento própria daquele change), mas `AddCardPage.jsx` não lia nenhum dos dois — "Tradução da frase" e "Classe gramatical" continuavam sempre vazios mesmo com "Usar sugestão"
- [x] 10.2 Em `applySuggestion` (`AddCardPage.jsx`), aplicar `suggestion.exampleTranslation` e `suggestion.partOfSpeech` aos campos de mesmo nome, do mesmo jeito que `translation`/`exampleSentence`/`synonyms`
- [x] 10.3 Exibir `exampleTranslation` e `partOfSpeech` na caixa de sugestão (`Alert`), quando presentes
- [x] 10.4 Atualizar a spec delta (`specs/decks/screens/spec.md`) e `design.md` com a correção
- [x] 10.5 Rodar `npm run lint` e `npm run build` e confirmar que passam sem erros
