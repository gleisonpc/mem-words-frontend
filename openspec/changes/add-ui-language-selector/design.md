## Context

Ver `proposal.md` para motivação. Hoje toda string de interface está
escrita diretamente em cada componente (`src/pages/`, `src/components/`),
sem nenhuma camada de tradução — 30 arquivos `.jsx` no total.

Duas preferências de aparelho já existem hoje, guardadas em
`localStorage`, cada uma resolvida por um módulo simples sem contexto
React:
- `src/theme.js` (`getTheme`/`setTheme`): decide a aparência via atributo
  `data-theme` no `<html>`, lido só pelo CSS — nenhum componente React
  precisa saber o tema ativo, então o módulo não precisa notificar
  ninguém quando o valor muda.
- `src/auth/tokenStore.js`: já usa um padrão de inscrição (`Set` de
  listeners, `onSessionEnded(listener)` devolvendo a função de
  cancelamento) para avisar `AuthProvider` quando a sessão termina.

Idioma é diferente de tema: o valor ativo decide *qual texto* cada
componente renderiza, então trocar o idioma precisa re-renderizar toda a
árvore que exibe texto — ao contrário do tema, que o CSS resolve sozinho.

O app é uma SPA sem SSR (`main.jsx` monta a árvore React em um HTML
inicial praticamente vazio) — diferente do tema, não existe risco de
"lampejo do idioma errado antes da pintura", porque nenhum texto é
pintado antes do React montar.

## Goals / Non-Goals

**Goals:**
- Um dicionário por idioma, com o mesmo formato e as mesmas chaves,
  para todo texto de interface hoje hardcoded em português.
- Trocar o idioma re-renderiza a interface inteira com o novo idioma,
  sem recarregar a página.
- Extensível: acrescentar uma chave nova não exige tocar em nada além
  dos dois arquivos de dicionário e do componente que a usa.

**Non-Goals:**
- Um formato de tradução com interpolação genérica (plurais, contagem,
  templates complexos) — as strings da interface hoje não têm nenhuma
  dessas necessidades; funções simples que recebem os poucos valores
  variáveis (ex. um nome) bastam.
- Detectar o idioma do navegador (`navigator.language`) para escolher o
  padrão inicial — português continua sendo o padrão para todo mundo,
  igual a tema "do sistema" ser sempre o ponto de partida.
- Traduzir comentários, documentação, ou o texto que o próprio usuário
  digita (nome de baralho, idioma do baralho, conteúdo de cards).

## Decisions

### Dicionários como objetos aninhados, uma chave por tela/seção

`src/i18n/dictionaries/pt.js` e `src/i18n/dictionaries/en.js` exportam um
objeto aninhado por tela (`addCard`, `profile`, `deckDetail`, `common`
para o que se repete entre telas — botões "Cancelar"/"Salvar", estados de
carregamento genéricos). Os dois arquivos SHALL ter exatamente a mesma
forma (mesmas chaves, aninhadas do mesmo jeito) — o par de arquivos
funciona como os dois temas de `tokens.css`: o mesmo "nome", valores
diferentes.

Acesso direto por propriedade (`t.addCard.searchButton`), não uma função
de busca por string (`t('addCard.searchButton')`): o projeto não usa
TypeScript, então nenhuma das duas formas dá checagem de chave em tempo
de compilação, mas o acesso por propriedade aproveita o autocomplete do
editor e devolve `undefined` (erro óbvio, visível na tela) em vez de uma
string de chave inteira aparecendo por engano na interface.

Alternativa descartada: uma biblioteca de i18n (`i18next`, `react-intl`).
Rejeitada por proporção: duas opções de idioma, sem plural complexo, sem
formatação de número, não justificam uma dependência nova e sua API
própria — os dois módulos novos (dicionários + um hook) resolvem o
problema inteiro.

### Módulo com inscrição (`useSyncExternalStore`), não Contexto React

`src/i18n/language.js` segue o mesmo formato de `getTheme`/`setTheme` —
`getLanguage()`, `setLanguage(lang)`, mais `subscribeLanguage(listener)`
no mesmo formato de `tokenStore.onSessionEnded` (`Set` de listeners,
devolve função de cancelamento). Diferente do tema, esse módulo precisa
avisar quem está inscrito quando o valor muda, porque o valor decide
texto renderizado, não uma classe CSS.

`src/i18n/useTranslations.js` expõe um hook (`useTranslations()`) que usa
`useSyncExternalStore(subscribeLanguage, getLanguage)` (nativo do React,
sem depender de Contexto/Provider) para obter o idioma ativo e devolve o
dicionário correspondente. Qualquer componente que chame o hook
re-renderiza sozinho quando o idioma muda — sem precisar de um
`<LanguageProvider>` envolvendo a árvore inteira, no mesmo espírito de
"nenhum contexto, nenhum provedor" já registrado para o tema.

Alternativa descartada: Contexto React
(`<LanguageProvider>`/`useContext`). Rejeitada porque `useSyncExternalStore`
com um módulo simples já resolve exatamente o mesmo problema
(re-renderizar consumidores quando um valor externo muda), sem introduzir
um provedor novo na árvore — e o projeto já tem precedente do padrão
"módulo + inscrição" em `tokenStore.js`.

### Atributo `lang` aplicado pelo mesmo módulo que aplica a escolha

`setLanguage` grava a escolha em `localStorage` (mesma chave/tolerância a
falha de `theme.js` e `tokenStore.js` — `try/catch` em volta de todo
acesso) e já aplica `document.documentElement.lang` na hora, do mesmo
jeito que `setTheme` já aplica o atributo `data-theme` na hora. Um
`useEffect` em `App.jsx` aplica o valor inicial na montagem (equivalente
ao que a leitura inicial de `getTheme()` já faz para o tema, só que sem
precisar do truque de script embutido em `index.html`, porque não há
pintura de texto para acontecer antes do React montar).

### Formatação de data: locale calculado a partir do idioma ativo

`DeckDetailPage.jsx` tem hoje `new Intl.DateTimeFormat('pt-BR', {...})`
fixo. Passa a receber o locale (`'pt-BR'` ou `'en-US'`) a partir do
idioma ativo (`useTranslations()` ou um pequeno utilitário
`localeForLanguage(language)` em `src/i18n/language.js`), recriando o
formatter quando o idioma muda — único ponto do código com formatação de
data hoje, então não há mais nenhum outro lugar a ajustar.

## Risks / Trade-offs

- [Dois arquivos de dicionário podem divergir em forma com o tempo
  (chave existe em um, falta no outro)] → aceito como risco de
  manutenção manual, do mesmo jeito que os dois blocos de tokens de tema
  já correm esse risco; nenhuma verificação automática existe para
  nenhum dos dois hoje.
- [Volume de mudança mecânica — todo `.jsx` com texto literal precisa
  trocar para o hook] → aceito; é o próprio propósito da mudança, e o
  `tasks.md` quebra por tela/componente para tornar cada passo pequeno e
  verificável.
- [`localStorage` indisponível ou bloqueado] → mesmo tratamento que
  `theme.js`/`tokenStore.js` já dão ao mesmo problema: falha silenciosa,
  aplicativo continua funcional em português (o padrão), só a
  persistência entre aberturas é perdida.

## Migration Plan

Só código de frontend e dois arquivos de dicionário; nenhuma migração de
dado, nenhuma mudança de contrato com o backend. Reversão: `git revert`
do commit, ou remover o seletor da tela de perfil (a escolha, se já
gravada em algum navegador, fica sem efeito depois que os dicionários e
o hook saírem — a interface volta a exibir só o texto português já
hardcoded de volta nos componentes).
