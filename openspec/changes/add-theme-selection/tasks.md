## 1. Tokens: sobreposição por atributo

- [x] 1.1 Em `src/styles/tokens.css`, adicionar `:root[data-theme="light"]`
      com os mesmos tokens já definidos em `:root` (tema claro) e
      `color-scheme: light` — confirmado por script que os 21 nomes
      batem exatamente com os de `:root` (cor + sombra).
- [x] 1.2 Adicionar `:root[data-theme="dark"]` com os mesmos tokens já
      definidos em `@media (prefers-color-scheme: dark) { :root {...} }`
      e `color-scheme: dark` — confirmado que os 21 nomes batem
      exatamente com os do bloco `@media`, e com o bloco claro.

## 2. Módulo de tema

- [x] 2.1 Criar `src/theme.js`: `getTheme()` (lê `localStorage`, devolve
      `'system'` por padrão ou se o valor guardado não for
      `'light'`/`'dark'`), `setTheme(theme)` (grava — ou remove a chave,
      para `'system'` — e aplica/remove `data-theme` em
      `document.documentElement`) — tolerante a falha de `localStorage`
      (mesmo padrão de `tokenStore.js`) — verificar manualmente as três
      opções via console do navegador. Verificado via Playwright
      (`/tmp/pw-check/verify-theme.mjs`): `getTheme()`/`setTheme()`
      produzem o `--color-bg` correto nas três opções e o ciclo
      sistema→claro→escuro→sistema termina com a chave de `localStorage`
      removida (`null`), não gravada como `"system"`.
- [x] 2.2 Chamar `setTheme(getTheme())` uma vez ao carregar `main.jsx`
      (antes de montar a árvore React), para garantir que o atributo
      reflita a escolha guardada mesmo que o script embutido de
      `index.html` não tenha rodado (ex.: `view-source`, ferramentas que
      ignoram scripts inline) — verificar que não há divergência entre o
      atributo aplicado pelo script embutido e pelo módulo. Confirmado:
      com tema fixado, o atributo `data-theme` já está correto
      imediatamente após `DOMContentLoaded` (antes do bundle de módulo
      rodar) — ver verificação do item 6.1.

## 3. Script embutido contra o lampejo

- [x] 3.1 Adicionar a `index.html`, no `<head>`, antes de qualquer folha
      de estilo, um `<script>` comum (sem `type="module"`, sem `defer`)
      que lê a mesma chave de `localStorage` e aplica `data-theme` em
      `document.documentElement` — envolto em `try/catch` — verificar,
      com o tema escuro fixado, que recarregar a página não mostra um
      lampejo do tema claro (inspecionar visualmente em conexão
      throttled ou pelo painel de performance). Confirmado em dois
      níveis: (1) `npm run build` gera `dist/index.html` com o script
      posicionado antes do `<script type="module">` e do
      `<link rel="stylesheet">`; (2) Playwright confirma
      `data-theme="dark"` já presente no elemento raiz no evento
      `domcontentloaded` de um reload com tema escuro fixado — a janela
      em que o lampejo poderia ocorrer não existe.

## 4. Seletor na tela de perfil

- [x] 4.1 Em `src/pages/ProfilePage.jsx`, adicionar a seção "Tema" com os
      três botões ("Do sistema", "Claro", "Escuro"), usando `Button` com
      `aria-pressed` no botão ativo (variante `primary` quando ativo,
      `secondary` quando não) — verificar que o botão correspondente à
      escolha atual aparece marcado ao abrir a tela. Confirmado via
      Playwright e capturas de tela (`profile-light.png`,
      `profile-dark.png`): o botão da opção ativa aparece com a variante
      `primary` e `aria-pressed="true"`, os demais com `secondary` e
      `aria-pressed="false"`.
- [x] 4.2 Clicar em uma opção chama `setTheme` e atualiza qual botão
      aparece ativo, sem recarregar a página — verificar as três
      transições (sistema→claro, claro→escuro, escuro→sistema).
      Confirmado via Playwright: o ciclo completo
      sistema→claro→escuro→sistema muda `--color-bg` a cada clique sem
      nenhuma navegação de página.

## 5. Verificação de build e lint

- [x] 5.1 `npm run build` sem erro. Confirmado.
- [x] 5.2 `npm run lint` sem aviso. Confirmado (exit 0).

## 6. Verificação manual ponta a ponta

- [x] 6.1 Com Playwright (`colorScheme` emulado): confirmar que "Do
      sistema" acompanha o SO nos dois cenários (SO claro, SO escuro);
      fixar "Escuro" com o SO em claro e confirmar que a interface fica
      escura; fixar "Claro" com o SO em escuro e confirmar que a
      interface fica clara; recarregar a página com um tema fixado e
      confirmar que ele persiste. Executado via
      `/tmp/pw-check/verify-theme.mjs` contra backend local (porta 3000)
      e frontend local (porta 5174): todos os cenários passaram —
      SO claro/"Do sistema" → `--color-bg: #f7f8fa`; SO escuro/"Do
      sistema" → `#101316`; SO claro + "Escuro" manual → `#101316`
      (`aria-pressed` migra corretamente); SO escuro + "Claro" manual →
      `#f7f8fa`; reload com "Escuro" fixado mantém `data-theme="dark"`
      logo após `domcontentloaded` e `--color-bg: #101316` após
      carregar; ciclo completo confirma o retorno a "Do sistema" limpa a
      chave de `localStorage` (`null`).
- [x] 6.2 Confirmar visualmente as telas existentes (lista de baralhos,
      detalhe de baralho, revisão, perfil) nos dois temas fixados
      manualmente — nenhuma regressão visual. Capturado via
      `/tmp/pw-check/screenshot-themes.mjs` (SO sempre claro, tema
      fixado manualmente via `data-theme`) para lista de baralhos
      (`home-light/dark.png`), detalhe de baralho
      (`deck-detail-light/dark.png`), revisão
      (`review-manual-light/dark.png`), perfil
      (`profile-light/dark.png`) e a galeria de componentes
      (`gallery-light/dark.png`) — todas as telas trocam de aparência
      corretamente, com contraste adequado e sem elementos quebrados em
      nenhum dos dois temas.

## 7. Verificação final

- [x] 7.1 `openspec validate --specs` passa para `design-system/tokens` e
      `account/profile-screen`.
