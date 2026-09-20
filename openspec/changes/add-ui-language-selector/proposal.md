## Why

A interface do mem-words hoje só existe em português — todo texto está
escrito diretamente nos componentes, sem nenhuma camada de tradução. O
usuário pediu a opção de usar a interface em inglês, com a troca
disponível na tela de Perfil, ao lado da escolha de tema já existente.

## What Changes

- Introduz uma camada de internacionalização (i18n): dois dicionários de
  texto de interface — português do Brasil (padrão, mesmo texto já usado
  hoje) e inglês — e um módulo que resolve qual dicionário está ativo.
- Todo texto de interface hoje hardcoded em português (rótulos, botões,
  mensagens de erro e sucesso, textos de tela vazia, títulos de página)
  passa a vir do dicionário ativo, em cada página e componente da
  aplicação.
- Adiciona a escolha de idioma à tela de Perfil, ao lado da escolha de
  tema: duas opções ("Português" e "English"), aplicada imediatamente,
  sem recarregar a página, persistida no navegador (mesmo padrão da
  escolha de tema — preferência de aparelho, não campo de conta no
  backend).
- Atualiza a convenção do projeto (`openspec/config.yaml`, "Textos de
  interface em português do Brasil") para refletir que a interface agora
  suporta os dois idiomas, com português como padrão.
- **Fora de escopo, permanece só em português**: comentários e
  documentação do código; conteúdo criado pelo usuário (nome de baralho,
  palavra, tradução, frase de exemplo, anotação pessoal); o texto livre
  que o próprio usuário digita como nome de idioma de um baralho (ex.
  "Inglês", "Português") — é dado do usuário, não string de interface, e
  não deriva do idioma da interface.

## Capabilities

### New Capabilities
- `i18n/ui-language`: dicionários de português e inglês para o texto de
  interface, resolução do idioma ativo, persistência no navegador e
  aplicação imediata sem recarregar a página.

### Modified Capabilities
- `account/profile-screen`: adiciona a escolha de idioma da interface,
  ao lado da escolha de tema já existente na tela de Perfil.

## Impact

- Todo arquivo em `src/pages/` e `src/components/` que hoje contém texto
  literal em português precisa passar a ler esse texto do dicionário
  ativo — o maior volume de mudança mecânica desta proposta, tocando
  praticamente toda a árvore de componentes.
- Novo módulo de i18n (dicionários + resolução do idioma ativo),
  seguindo o mesmo padrão já usado por `src/theme.js` (módulo simples,
  sem contexto React, gravação em `localStorage` com o mesmo cuidado de
  falha silenciosa).
- `ProfilePage.jsx`/`.css`: novo controle de escolha de idioma.
- `openspec/config.yaml`: convenção de "texto de interface em português"
  atualizada para descrever os dois idiomas suportados.
- Nenhuma mudança de contrato com o backend (`mem-words-backend`) — é
  preferência de navegador, como o tema.
