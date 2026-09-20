## Context

Ver `proposal.md`. Hoje `CreateCardForm` (`src/pages/DeckDetailPage.jsx:380-411`)
é renderizado no fim de `DeckDetailPage`, reaproveitando `cardValidate`,
`cardInputFromValues`, `cardFields`, `EMPTY_CARD_VALUES`, `synonymsToText`,
`textToSynonyms`, `optionalText`, `requiredText` e `describeApiError` — as
mesmas funções que `CardEditForm` (que continua na tela de detalhe) usa. Ao
extrair a criação para tela própria, essas funções passam a servir duas
telas em arquivos diferentes.

O card, hoje, não tem campo de áudio (`src/api/cards.js`, `createCard`) — o
backend (`mem-words-backend`, repositório separado, fora deste escopo) não o
expõe. O mockup menciona "áudio" na sugestão automática, mas nenhum lugar do
formulário mostra um controle de áudio; sem campo para persisti-lo, este
change não grava áudio algum (ver Non-Goals).

Levantamento de serviços públicos, sem chave, chamáveis direto do navegador
(testados nesta sessão, a partir do ambiente de desenvolvimento):
- Wiktionary REST (`https://en.wiktionary.org/api/rest_v1/page/definition/{word}`)
  — infraestrutura da Wikimedia, respondeu de forma estável nos testes.
  Devolve definições por classe gramatical em inglês, cada uma com
  `parsedExamples`/`examples` quando existem.
- Datamuse (`https://api.datamuse.com/words?rel_syn={word}&max=8`) — respondeu
  de forma estável, devolve uma lista de palavras relacionadas por
  similaridade de sentido (usado como sinônimos).
- MyMemory (`https://api.mymemory.translated.net/get?q={word}&langpair={de}|{para}`)
  — respondeu (o teste bateu na cota diária do IP do ambiente de
  desenvolvimento, não em um problema de alcance); `responseStatus` no corpo
  distingue sucesso de cota excedida.
- `api.dictionaryapi.dev` (Free Dictionary API) foi cogitada por juntar
  definição/exemplo/sinônimo/áudio em uma única chamada, mas está fora do ar
  (erro 522 do Cloudflare em várias tentativas nesta sessão) — descartada
  como dependência principal.

Nenhum dos três serviços escolhidos determina, sozinho, o par de idiomas do
baralho (texto livre digitado pelo usuário, ex. "Inglês"/"Português") — a
tela precisa de uma tabela própria, pequena, que reconheça nomes comuns em
português/inglês para um punhado de idiomas.

## Goals / Non-Goals

**Goals:**
- Criação de card em tela própria, endereçável por URL, reaproveitando os
  campos, validação e comportamento hoje em `DeckDetailPage.jsx`.
- Sugestão automática de tradução, frase de exemplo e sinônimos, aplicada
  só mediante confirmação, e que nunca impede nem atrapalha o preenchimento
  manual quando a sugestão não está disponível.

**Non-Goals:**
- Sugestão ou reprodução de áudio — sem campo no card para persistir e sem
  serviço estável e testado para obtê-lo neste change.
- Sugestão para pares de idiomas fora da tabela reconhecida (ver Decisions)
  — esses baralhos continuam com entrada manual, sem indicação de que
  "falhou", porque nunca chegam a tentar.
- Mudança no backend ou no modelo de dados do card.
- Um seletor de baralho com busca/paginação — a lista vem inteira de
  `listDecks()` (já usada pela lista de baralhos), sem paginação hoje.

## Decisions

### Rota própria por baralho, com campo de baralho trocável

`/baralhos/:id/cards/novo`, sob os mesmos grupos de rota
(`RequireAuth`/`AuthenticatedLayout`) das demais rotas de baralho — mantém o
padrão já usado (`/baralhos/:id/revisar`) e o card, ao entrar pela tela de
detalhe, já nasce associado ao baralho certo sem exigir escolha.

O mockup mostra um campo "Baralho" como um seletor, não um rótulo fixo —
reproduzido como um `<select>` (mesmo padrão já usado no filtro de status de
`DeckDetailPage.jsx`) populado por `listDecks()`, pré-selecionado com o `:id`
da rota. Trocar a seleção não navega: o `:id` da URL só decide o valor
inicial do campo; o card é criado no baralho escolhido no `<select>` no
momento do envio, e o "voltar" ao final leva ao baralho escolhido, não
necessariamente ao da URL original.

Alternativa descartada: rota sem baralho na URL (`/cards/novo`), com o
`<select>` como única fonte da escolha. Rejeitada porque a tela de detalhe é
hoje o único lugar que leva à criação de card — nada no app precisa de uma
entrada "solta"; manter o baralho na URL preserva o link direto
("criar card no baralho X") sem perder a flexibilidade de trocar antes de
salvar.

### Campos e validação extraídos para módulo compartilhado

`cardValidate`, `cardInputFromValues`, `cardFields`, `EMPTY_CARD_VALUES`,
`synonymsToText`, `textToSynonyms`, `optionalText`, `requiredText` e
`describeApiError` saem de `DeckDetailPage.jsx` para um módulo novo,
`src/pages/cardForm.jsx` (funções puras e um componente de campos, sem
estado próprio) — usado pela tela nova (formulário de criação) e por
`CardEditForm`, que continua em `DeckDetailPage.jsx`. `CreateCardForm` e o
estado que só existia para ele (`createFormKey`) saem de `DeckDetailPage.jsx`
por completo.

Alternativa descartada: duplicar as funções na tela nova. Rejeitada porque
são a mesma regra de validação (espelha o backend) em dois lugares — a
motivação já registrada no requirement "Validação no cliente espelhando as
regras do backend" para não ter duas fontes da mesma regra.

### Sugestão automática: tabela de idiomas reconhecidos, busca ao perder o foco na palavra

Tabela local, em `src/api/dictionaryLookup.js`, mapeando texto comum (em
português e inglês, sem diferenciar maiúsculas/acentos) para um código: pelo
menos inglês, português, espanhol, francês, alemão, italiano e japonês. A
sugestão só é buscada quando um dos dois lados do par — origem ou destino,
em qualquer ordem — mapeia para inglês (`en`) e o outro mapeia para algum
código da tabela.

> **Correção pós-merge (verificada em produção):** a primeira versão exigia
> que fosse especificamente o idioma de *origem* a mapear para inglês.
> Baralhos reais, porém, guardam o par nos dois sentidos — "Inglês →
> Português" e "Português → Inglês" — porque o backend não amarra
> `sourceLanguage`/`targetLanguage` a qual campo do card (`word`/
> `translation`) cada um descreve; é só texto livre. Um baralho de produção
> com `sourceLanguage: "Portugues"` e `targetLanguage: "ingles"` (card em
> inglês, tradução em português) não disparava a sugestão nenhuma, sem
> nenhum erro visível — o comportamento "par não reconhecido" mascarava o
> que era, na prática, o par mais comum. `resolveLanguagePair` agora aceita
> os dois sentidos: o lado que mapeia para inglês vira `source` (o que
> entra nas buscas de definição/sinônimos), e o outro lado vira `target` (o
> código da tradução), qualquer que seja a ordem em que estejam no baralho.

É sempre a palavra em inglês que entra nas buscas de definição/sinônimos —
os dois serviços escolhidos só cobrem inglês. Fora do reconhecido em
qualquer sentido, a tela nunca chama os serviços externos: não há
"tentativa que falha", porque o par não é reconhecido.

A busca dispara quando o campo Palavra perde o foco (`onBlur`), não a cada
tecla — evita uma chamada por caractere digitado. As três chamadas (Wiktionary,
Datamuse, MyMemory) saem em paralelo (`Promise.allSettled`); cada uma que
falhar ou não devolver conteúdo aproveitável simplesmente não contribui à
sugestão. A caixa de sugestão só aparece quando ao menos uma das três traz
algo; se nenhuma trouxer, nada é exibido, sem mensagem de "sem sugestão"
(silencioso, como o requirement pede).

Alternativa descartada: debounce a cada tecla digitada. Rejeitada porque
Wiktionary/Datamuse/MyMemory são consultados por palavra inteira — buscar a
cada poucas teclas geraria uma sequência de requisições descartadas sem
necessidade; `onBlur` já cobre o caso de uso (preencher a palavra e seguir
para o próximo campo) com uma única chamada.

### Cliente de dicionário isolado, com tempo limite curto e falha nunca lançada

`src/api/dictionaryLookup.js` não reaproveita `src/api/client.js` (que é
específico do backend do mem-words — token, renovação de sessão, URL base
configurada). É um módulo à parte, com `fetch` e `AbortController` própios,
tempo limite curto (a soma das três chamadas não deve travar a tela — 4s por
chamada, contra os 15s do backend, que hiberna e pode legitimamente demorar;
os serviços de dicionário não têm esse motivo para demorar). Sua função
principal nunca lança: qualquer falha (rede, tempo limite, resposta sem
conteúdo aproveitável) devolve partes ausentes da sugestão, e a tela decide
não mostrar nada quando as três faltam.

Alternativa descartada: propagar erro e mostrar um alerta de "sugestão
indisponível". Rejeitada pelo requirement da proposta — a sugestão é um
extra, e um alerta de erro para um extra que falhou chamaria atenção para
algo que a pessoa não pediu.

### Aplicar a sugestão sobrescreve os campos correspondentes

"Usar sugestão" sobrescreve tradução, frase de exemplo e sinônimos com o que
foi encontrado, mesmo que a pessoa já tivesse digitado algo neles —
mais simples de prever do que uma regra de "só preenche campo vazio", e
consistente com o mockup, que oferece "Usar sugestão"/"Descartar" como
escolha binária antes de qualquer edição manual nesses campos. Depois de
aplicada, os campos continuam editáveis normalmente. Um segundo `onBlur` com
a palavra alterada substitui a caixa de sugestão anterior (não acumula).

## Risks / Trade-offs

- Os três serviços são gratuitos e sem SLA — instabilidade futura (como a já
  observada em `api.dictionaryapi.dev`) degrada para "sem sugestão", nunca
  para tela quebrada, mas o recurso pode parecer "não funciona" em uma
  eventual instabilidade real desses serviços.
- Cobertura de idiomas limitada à tabela local — baralhos com idiomas fora
  dela (ou grafados de um jeito não previsto na tabela) não recebem sugestão
  nenhuma, sem indicação de que existiria se o idioma fosse outro. Aceito
  como escopo inicial; a tabela é o lugar único a estender depois.
- Sinônimos vêm do Datamuse por similaridade estatística, não por curadoria
  — pode incluir palavras próximas mas não intercambiáveis. Como a sugestão
  exige confirmação e o campo continua editável, o risco fica limitado a
  exigir revisão da pessoa, não a gravar algo errado sem chance de correção.
