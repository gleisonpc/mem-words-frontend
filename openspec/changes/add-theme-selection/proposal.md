## Why

O app só segue a preferência de tema do sistema operacional — não há
como escolher um tema fixo independente do sistema. O mockup do Perfil já
prevê essa escolha ("Do sistema" / "Claro" / "Escuro"), e é puramente
frontend: os tokens de design já têm os dois temas completos, falta só a
forma de fixar um deles por cima da preferência do sistema.

## What Changes

- A tela de perfil ganha um seletor de tema com três opções: "Do
  sistema" (padrão — segue o sistema operacional, como hoje), "Claro" e
  "Escuro".
- A escolha persiste no navegador (não é dado de conta, não sincroniza
  entre dispositivos) e é aplicada imediatamente, sem recarregar a
  página, e novamente a cada abertura do app.
- `src/styles/tokens.css` ganha a sobreposição explícita dos dois temas,
  ativada por um atributo no elemento raiz — usada apenas quando "Claro"
  ou "Escuro" é escolhido; "Do sistema" deixa o atributo ausente, e o
  comportamento atual (`prefers-color-scheme`) continua valendo sozinho.
- Novo módulo `src/theme.js`, e um pequeno script embutido em
  `index.html` que aplica a escolha guardada antes de qualquer CSS
  carregar — evita um lampejo do tema errado ao abrir o app.

## Capabilities

### Modified Capabilities

- `design-system/tokens`: o requisito de tema claro/escuro passa a
  descrever a preferência do sistema como o padrão, substituível por uma
  escolha manual persistida.
- `account/profile-screen`: ganha o seletor de tema.

## Impact

- `src/styles/tokens.css`: blocos de sobreposição para `data-theme="light"`
  e `data-theme="dark"`.
- `src/theme.js`: novo — lê/grava a escolha e aplica o atributo no
  elemento raiz.
- `index.html`: novo script embutido (não-módulo, síncrono) que aplica a
  escolha guardada antes da primeira pintura.
- `src/pages/ProfilePage.jsx` (+ CSS): novo seletor de tema.
- Nenhuma dependência nova, nenhuma mudança no backend — a escolha nunca
  sai do navegador.
