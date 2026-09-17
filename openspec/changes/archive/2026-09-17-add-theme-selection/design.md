## Context

Ver `proposal.md` para motivação. Hoje `src/styles/tokens.css` define os
tokens semânticos duas vezes: uma vez em `:root` (tema claro, o padrão) e
uma vez dentro de `@media (prefers-color-scheme: dark)` (tema escuro). Não
existe nenhum mecanismo para fixar um tema independente da preferência do
sistema operacional.

O app é uma SPA servida por Vite, sem SSR: o HTML inicial é estático
(`index.html`), e `main.jsx` monta a árvore React nele.

## Goals / Non-Goals

**Goals:**
- Escolher "Claro" ou "Escuro" independente do sistema operacional, com a
  escolha persistindo entre aberturas do app.
- Nenhum lampejo do tema errado ao abrir o app com uma escolha manual
  guardada.
- "Do sistema" continua se comportando exatamente como hoje.

**Non-Goals:**
- Sincronizar a escolha entre dispositivos ou contas — é preferência do
  navegador, como o tema do próprio sistema operacional é preferência do
  aparelho. Não é campo do usuário no backend.
- Reagir em tempo real a uma mudança do tema do sistema operacional
  enquanto "Do sistema" está selecionado e o app está aberto — o CSS
  (`prefers-color-scheme`) já faz isso sozinho, sem JavaScript algum;
  nada nesta mudança precisa observar essa preferência.

## Decisions

### Atributo no elemento raiz, não uma classe

A escolha manual é aplicada como `data-theme="light"` ou
`data-theme="dark"` no elemento `<html>`. "Do sistema" é a ausência do
atributo — não um terceiro valor — porque nesse caso o comportamento
correto é simplesmente não interferir: o `@media (prefers-color-scheme)`
já existente continua sendo a única fonte, sem um valor "system" para o
CSS ter de tratar como caso especial.

`tokens.css` ganha dois blocos novos, com seletor `:root[data-theme="light"]`
e `:root[data-theme="dark"]`, repetindo os mesmos tokens já definidos em
`:root` e em `@media (prefers-color-scheme: dark) { :root {...} }`,
respectivamente. Um seletor de atributo tem mais especificidade que
`:root` sozinho (com ou sem `@media` em volta, que não soma
especificidade), então esses blocos vencem em qualquer um dos dois temas
do sistema, sem depender da ordem das regras no arquivo. Cada bloco
também fixa `color-scheme` (`light` ou `dark`) para que controles nativos
do navegador (scrollbar, `<input type="date">`, etc.) sigam a escolha
manual, e não a do sistema.

Alternativa descartada: `data-theme="system"` como terceiro valor
explícito, com um bloco CSS que reafirma "siga o `@media`" — impossível de
expressar em CSS puro (não há como uma regra dizer "ignore-me, use a
media query"), e desnecessário: remover o atributo já produz o efeito
certo.

### `theme.js`: módulo único, sem contexto React

Só uma tela (Perfil) lê e altera a escolha; nenhuma outra parte da
aplicação precisa saber qual tema está ativo — quem decide a aparência é
o CSS, lendo o atributo, não JavaScript espalhado pelos componentes (é
literalmente um requisito já existente: "nenhuma lógica condicional de
tema existe no componente"). Por isso a escolha vive num módulo simples
(`getTheme`, `setTheme`), no mesmo espírito de `tokenStore.js` — sem
contexto, sem provedor, sem assinatura: `setTheme` já aplica o atributo
na hora, e `ProfilePage` só guarda em estado local qual botão está
marcado.

### Script embutido em `index.html`, duplicando a leitura mínima

`main.jsx` só executa depois que o HTML é interpretado e, em produção, a
folha de estilos (que bloqueia a primeira pintura) já pode ter carregado
— rodar a aplicação da escolha de tema a partir de `theme.js` chegaria
tarde demais para evitar o lampejo do tema errado quando a escolha manual
diverge do sistema operacional.

A correção é um `<script>` comum (não-módulo, sem `defer`) no `<head>` de
`index.html`, antes de qualquer folha de estilo, que lê a mesma chave do
`localStorage` e aplica o mesmo atributo — só essas poucas linhas,
duplicadas de propósito: um `<script type="module">` não rodaria a tempo
(é adiado por natureza), e importar `theme.js` ali também não ajudaria,
porque o problema não é *onde* a lógica mora, é *quando* ela roda. A
duplicação é o preço da técnica, documentado no próprio arquivo.

### Escolha "Do sistema" limpa o `localStorage`, não grava `"system"`

Sem um valor gravado, `getTheme()` já devolve "do sistema" por padrão —
gravar a string `"system"` seria um segundo jeito de dizer a mesma coisa
que "nada gravado" já diz.

## Risks / Trade-offs

- [Duplicação da leitura de `localStorage` entre `index.html` e
  `theme.js`] → aceito; é inerente à técnica de evitar lampejo antes da
  primeira pintura, documentado nos dois lugares para não parecer
  acidental.
- [`localStorage` indisponível ou bloqueado] → mesmo tratamento que
  `tokenStore.js` já dá ao mesmo problema: falha silenciosa, aplicativo
  continua funcional, só a persistência entre aberturas é perdida — o
  script embutido também precisa desse mesmo cuidado (`try/catch`).

## Migration Plan

Só CSS e um módulo novo; nenhuma migração de dado, nenhuma mudança de
contrato com o backend. Reversão: `git revert` do commit, ou remover o
seletor da tela de perfil (o atributo, se já gravado em algum navegador,
fica sem efeito depois que os blocos de CSS saem — degrada para "do
sistema" sozinho).
