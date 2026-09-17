## 1. Tokens: sobreposição por atributo

- [ ] 1.1 Em `src/styles/tokens.css`, adicionar `:root[data-theme="light"]`
      com os mesmos tokens já definidos em `:root` (tema claro) e
      `color-scheme: light` — verificar por leitura que todos os nomes
      batem exatamente com os de `:root`.
- [ ] 1.2 Adicionar `:root[data-theme="dark"]` com os mesmos tokens já
      definidos em `@media (prefers-color-scheme: dark) { :root {...} }`
      e `color-scheme: dark` — mesma verificação de simetria de nomes.

## 2. Módulo de tema

- [ ] 2.1 Criar `src/theme.js`: `getTheme()` (lê `localStorage`, devolve
      `'system'` por padrão ou se o valor guardado não for
      `'light'`/`'dark'`), `setTheme(theme)` (grava — ou remove a chave,
      para `'system'` — e aplica/remove `data-theme` em
      `document.documentElement`) — tolerante a falha de `localStorage`
      (mesmo padrão de `tokenStore.js`) — verificar manualmente as três
      opções via console do navegador.
- [ ] 2.2 Chamar `setTheme(getTheme())` uma vez ao carregar `main.jsx`
      (antes de montar a árvore React), para garantir que o atributo
      reflita a escolha guardada mesmo que o script embutido de
      `index.html` não tenha rodado (ex.: `view-source`, ferramentas que
      ignoram scripts inline) — verificar que não há divergência entre o
      atributo aplicado pelo script embutido e pelo módulo.

## 3. Script embutido contra o lampejo

- [ ] 3.1 Adicionar a `index.html`, no `<head>`, antes de qualquer folha
      de estilo, um `<script>` comum (sem `type="module"`, sem `defer`)
      que lê a mesma chave de `localStorage` e aplica `data-theme` em
      `document.documentElement` — envolto em `try/catch` — verificar,
      com o tema escuro fixado, que recarregar a página não mostra um
      lampejo do tema claro (inspecionar visualmente em conexão
      throttled ou pelo painel de performance).

## 4. Seletor na tela de perfil

- [ ] 4.1 Em `src/pages/ProfilePage.jsx`, adicionar a seção "Tema" com os
      três botões ("Do sistema", "Claro", "Escuro"), usando `Button` com
      `aria-pressed` no botão ativo (variante `primary` quando ativo,
      `secondary` quando não) — verificar que o botão correspondente à
      escolha atual aparece marcado ao abrir a tela.
- [ ] 4.2 Clicar em uma opção chama `setTheme` e atualiza qual botão
      aparece ativo, sem recarregar a página — verificar as três
      transições (sistema→claro, claro→escuro, escuro→sistema).

## 5. Verificação de build e lint

- [ ] 5.1 `npm run build` sem erro.
- [ ] 5.2 `npm run lint` sem aviso.

## 6. Verificação manual ponta a ponta

- [ ] 6.1 Com Playwright (`colorScheme` emulado): confirmar que "Do
      sistema" acompanha o SO nos dois cenários (SO claro, SO escuro);
      fixar "Escuro" com o SO em claro e confirmar que a interface fica
      escura; fixar "Claro" com o SO em escuro e confirmar que a
      interface fica clara; recarregar a página com um tema fixado e
      confirmar que ele persiste.
- [ ] 6.2 Confirmar visualmente as telas existentes (lista de baralhos,
      detalhe de baralho, revisão, perfil) nos dois temas fixados
      manualmente — nenhuma regressão visual.

## 7. Verificação final

- [ ] 7.1 `openspec validate --specs` passa para `design-system/tokens` e
      `account/profile-screen`.
