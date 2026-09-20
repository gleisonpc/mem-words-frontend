## 1. Infraestrutura de i18n

- [ ] 1.1 Criar `src/i18n/language.js`: `getLanguage()`/`setLanguage(lang)` seguindo o mesmo padrão de `try/catch` em volta do `localStorage` que `src/theme.js` já usa, com `subscribeLanguage(listener)` no formato de `tokenStore.onSessionEnded` (`Set` de listeners, devolve função de cancelamento); `setLanguage` já aplica `document.documentElement.lang` na hora; incluir `localeForLanguage(language)` (`'pt-BR'`/`'en-US'`) para uso em `Intl.DateTimeFormat`
- [ ] 1.2 Criar `src/i18n/dictionaries/pt.js` com um objeto aninhado por tela (`common`, `addCard`, `profile`, `deckDetail`, etc.) contendo o texto português já usado hoje, extraído tela por tela nas seções seguintes
- [ ] 1.3 Criar `src/i18n/dictionaries/en.js` com exatamente a mesma forma de `pt.js` (mesmas chaves, mesmo aninhamento), com o texto traduzido para inglês
- [ ] 1.4 Criar `src/i18n/useTranslations.js`: hook que usa `useSyncExternalStore(subscribeLanguage, getLanguage)` e devolve o dicionário correspondente ao idioma ativo
- [ ] 1.5 Em `App.jsx`, aplicar `document.documentElement.lang` a partir de `getLanguage()` na montagem (mesmo papel que a leitura inicial de tema já cumpre para `data-theme`) e verificar que o atributo `lang` do `<html>` está correto ao carregar a página
- [ ] 1.6 Rodar `npm run lint` e confirmar que os três arquivos novos passam sem erros

## 2. Extrair strings — componentes base

- [ ] 2.1 `src/components/ui/*.jsx` (Alert, Badge, Button, Card, ConfirmDeleteButton, Input, Pagination, ProgressBar, Spinner): extrair todo texto literal de interface (rótulos padrão, textos de confirmação, mensagens de estado) para `common` no dicionário e trocar para `useTranslations()`
- [ ] 2.2 `src/components/AuthenticatedLayout.jsx`, `src/components/PageLoading.jsx`, `src/components/HealthStatus.jsx`, `src/components/Gallery.jsx`: mesma extração
- [ ] 2.3 Rodar `npm run lint` e `npm run build`, confirmar que passam sem erros

## 3. Extrair strings — autenticação

- [ ] 3.1 `src/pages/AuthScreen.jsx`, `src/pages/LoginPage.jsx`, `src/pages/RegisterPage.jsx`: extrair rótulos de campo, botões, mensagens de erro/sucesso e textos de validação para uma seção `auth` no dicionário
- [ ] 3.2 Testado manualmente no dev server: alternar para inglês na tela de perfil (task 6) e voltar para login/logout — confirmar que as telas de autenticação mostram o idioma ativo

## 4. Extrair strings — baralhos e cards

- [ ] 4.1 `src/pages/HomePage.jsx`: extrair para uma seção `home`
- [ ] 4.2 `src/pages/DeckDetailPage.jsx`: extrair para uma seção `deckDetail`, incluindo os textos de `DeckEditForm`, `DeckHeader`, `DeckStats`; trocar `CREATED_MONTH_FORMAT` para usar o locale ativo (`localeForLanguage`) via um hook ou recomputado quando o idioma mudar
- [ ] 4.3 `src/pages/AddCardPage.jsx` e `src/pages/cardForm.jsx`: extrair para uma seção `addCard`, incluindo os textos de sugestão de dicionário ("Buscar sugestão", "Usar sugestão", "Nenhuma sugestão encontrada...", rótulos de campo)
- [ ] 4.4 Rodar `npm run lint` e `npm run build`, confirmar que passam sem erros

## 5. Extrair strings — revisão, perfil e diversos

- [ ] 5.1 `src/pages/ReviewSessionPage.jsx`: extrair para uma seção `review`
- [ ] 5.2 `src/pages/ProfilePage.jsx`: extrair para uma seção `profile` (incluindo `ThemeSelector`, `AccountForm`, `DeleteAccountForm`, `PasswordForm`)
- [ ] 5.3 `src/pages/NotFoundPage.jsx`, `src/pages/DiagnosticsPage.jsx`, `src/routes.jsx`: extrair o texto restante
- [ ] 5.4 Rodar `npm run lint` e `npm run build`, confirmar que passam sem erros

## 6. Escolha de idioma na tela de Perfil

- [ ] 6.1 Em `ProfilePage.jsx`, adicionar `LanguageSelector` ao lado de `ThemeSelector` (mesmo padrão visual: botões "Português"/"English", `aria-pressed` na opção ativa), chamando `setLanguage` e atualizando o estado local ao clicar
- [ ] 6.2 Testado manualmente no dev server: escolher "English" muda a interface inteira imediatamente sem recarregar; recarregar a página mantém "English" ativo; voltar para "Português" restaura o texto original
- [ ] 6.3 Testado manualmente: com "English" ativo, criar/editar um baralho com nome e idiomas em português — confirmar que esses valores continuam exatamente como digitados, sem tradução automática

## 7. Atualizar convenção do projeto e verificação final

- [ ] 7.1 Atualizar `openspec/config.yaml` (`context`): trocar "Textos de interface em português do Brasil" pela descrição de que a interface suporta português (padrão) e inglês, com a escolha na tela de Perfil
- [ ] 7.2 Buscar por texto literal em português remanescente nos arquivos `.jsx` de `src/pages/` e `src/components/` (fora de comentários) para confirmar que nenhuma tela ficou sem migrar
- [ ] 7.3 Rodar `npm run lint` e `npm run build` no repositório inteiro e confirmar que passam sem erros
- [ ] 7.4 Testado manualmente, ponta a ponta: navegar por todas as telas principais (login, home, detalhe de baralho, criar card, revisão, perfil) com inglês ativo, confirmando que nenhum texto de interface aparece em português por engano
