## Why

Criar um card hoje é um formulário embutido no fim da tela de detalhe do
baralho — sete campos, cinco deles manuais, sem nenhuma ajuda para
preenchê-los. O mockup do produto ("Nova palavra") mostra uma tela própria,
dedicada a criar um card, que sugere tradução, frase de exemplo e sinônimos
a partir de um dicionário assim que a palavra é digitada — tudo revisável e
editável antes de salvar. Separar a tela e adicionar essa sugestão reduz o
trabalho manual de montar um card bom (o que a spec já valoriza: "cards com
frase são lembrados melhor que palavra isolada") e aproxima a implementação
do mockup.

## What Changes

- A criação de card deixa de ser um formulário embutido no fim da tela de
  detalhe do baralho e passa a ter tela própria, endereçável por URL
  (`/baralhos/:id/cards/novo`). A tela de detalhe passa a oferecer uma ação
  que leva a essa tela, em vez de exibir o formulário inline.
- A nova tela, quando o par de idiomas do baralho é reconhecido (origem
  inglês; destino entre os idiomas mapeados), busca automaticamente, contra
  serviços públicos de dicionário/tradução, uma sugestão de tradução, frase
  de exemplo e sinônimos para a palavra digitada, e oferece usá-la ou
  descartá-la antes de preencher os campos — nenhum desses campos é
  preenchido sem confirmação explícita.
- Falha ou indisponibilidade de qualquer serviço externo, ou par de idiomas
  não reconhecido, degrada silenciosamente: a tela funciona exatamente como
  o formulário atual, sem sugestão e sem erro visível — a busca automática é
  um extra, nunca um bloqueio.
- Ao salvar, o usuário é levado de volta à tela de detalhe do baralho, com o
  card novo já na lista (mesmo comportamento hoje obtido com "criar e
  continuar" adicionando outro em seguida — a nova tela mantém as duas
  ações, "Salvar" e "Salvar e criar outra").

## Capabilities

### Modified Capabilities

- `decks/screens`: a criação de card deixa de ser um formulário embutido na
  tela de detalhe e passa a ser uma tela própria, endereçável por URL, com
  sugestão automática de tradução/frase de exemplo/sinônimos a partir de
  serviços públicos de dicionário, aplicada apenas mediante confirmação.

## Impact

- `src/routes.jsx`: nova rota `/baralhos/:id/cards/novo`, sob os mesmos
  grupos (`RequireAuth`/`AuthenticatedLayout`) das demais rotas de baralho.
- `src/pages/DeckDetailPage.jsx`: remove `CreateCardForm` e o estado
  associado (`createFormKey`); ganha um link/botão para a nova rota.
- Novo `src/pages/AddCardPage.jsx` (e `.css`): tela de criação de card,
  reaproveitando os campos e validação hoje em `DeckDetailPage.jsx`
  (`cardValidate`, `cardInputFromValues`, `cardFields` — movidos ou
  extraídos para reuso pelas duas telas, já que `CardEditForm` continua na
  tela de detalhe).
- Novo `src/api/dictionaryLookup.js`: cliente para os serviços públicos de
  dicionário (Wiktionary REST), sinônimos (Datamuse) e tradução (MyMemory),
  sem autenticação, com tempo limite próprio e falha sempre tratada como
  "sem sugestão" — nunca lançada para quebrar a tela.
- Sem mudança no backend (`mem-words-backend`) nem no modelo de card: a
  sugestão de áudio mencionada no mockup não é implementada, porque não há
  onde persisti-la (ver design.md, Non-Goals).
