## 1. Infraestrutura de i18n

- [x] 1.1 Criar `src/i18n/language.js`: `getLanguage()`/`setLanguage(lang)` seguindo o mesmo padrão de `try/catch` em volta do `localStorage` que `src/theme.js` já usa, com `subscribeLanguage(listener)` no formato de `tokenStore.onSessionEnded` (`Set` de listeners, devolve função de cancelamento); `setLanguage` já aplica `document.documentElement.lang` na hora; incluir `localeForLanguage(language)` (`'pt-BR'`/`'en-US'`) para uso em `Intl.DateTimeFormat`
- [x] 1.2 Criar `src/i18n/dictionaries/pt.js` com um objeto aninhado por tela (`common`, `addCard`, `profile`, `deckDetail`, etc.) contendo o texto português já usado hoje, extraído tela por tela nas seções seguintes
- [x] 1.3 Criar `src/i18n/dictionaries/en.js` com exatamente a mesma forma de `pt.js` (mesmas chaves, mesmo aninhamento), com o texto traduzido para inglês
- [x] 1.4 Criar `src/i18n/useTranslations.js`: hook que usa `useSyncExternalStore(subscribeLanguage, getLanguage)` e devolve o dicionário correspondente ao idioma ativo
- [x] 1.5 Em `App.jsx`, aplicar `document.documentElement.lang` a partir de `getLanguage()` na montagem (mesmo papel que a leitura inicial de tema já cumpre para `data-theme`) e verificar que o atributo `lang` do `<html>` está correto ao carregar a página
- [x] 1.6 Rodar `npm run lint` e confirmar que os três arquivos novos passam sem erros

## 2. Extrair strings — componentes base

- [x] 2.1 `src/components/ui/*.jsx` (Alert, Badge, Button, Card, ConfirmDeleteButton, Input, Pagination, ProgressBar, Spinner): extrair todo texto literal de interface (rótulos padrão, textos de confirmação, mensagens de estado) para `common` no dicionário e trocar para `useTranslations()`
- [x] 2.2 `src/components/AuthenticatedLayout.jsx`, `src/components/PageLoading.jsx`, `src/components/HealthStatus.jsx`, `src/components/Gallery.jsx`: mesma extração
- [x] 2.3 Rodar `npm run lint` e `npm run build`, confirmar que passam sem erros

## 3. Extrair strings — autenticação

- [x] 3.1 `src/pages/AuthScreen.jsx`, `src/pages/LoginPage.jsx`, `src/pages/RegisterPage.jsx`: extrair rótulos de campo, botões, mensagens de erro/sucesso e textos de validação para uma seção `auth` no dicionário (incluiu também `src/auth/validation.js`, `src/auth/session.js`, `src/auth/AuthProvider.jsx` e `src/auth/useAuthForm.js` — mensagens de validação/sessão que essas telas exibem, mas que moram nesses módulos, não nos arquivos `.jsx` das telas)
- [x] 3.2 Testado manualmente (Chromium/Playwright, backend local): alternar para inglês na tela de perfil, sair da conta e confirmar que a tela de entrada mostra "Sign in"/"Email"/"Password" em inglês; mensagens de validação (nome/e-mail/senha vazios) também saem em inglês

## 4. Extrair strings — baralhos e cards

- [x] 4.1 `src/pages/HomePage.jsx`: extrair para uma seção `home`
- [x] 4.2 `src/pages/DeckDetailPage.jsx`: extrair para uma seção `deckDetail`, incluindo os textos de `DeckEditForm`, `DeckHeader`, `DeckStats`; trocar `CREATED_MONTH_FORMAT` para usar o locale ativo (`localeForLanguage`) via um hook ou recomputado quando o idioma mudar
- [x] 4.3 `src/pages/AddCardPage.jsx` e `src/pages/cardForm.jsx`: extrair para uma seção `addCard` (campos compartilhados de `cardForm.jsx` foram para `cardFields`, reaproveitado por `DeckDetailPage` também), incluindo os textos de sugestão de dicionário ("Buscar sugestão", "Usar sugestão", "Nenhuma sugestão encontrada...", rótulos de campo)
- [x] 4.4 Rodar `npm run lint` e `npm run build`, confirmar que passam sem erros

## 5. Extrair strings — revisão, perfil e diversos

- [x] 5.1 `src/pages/ReviewSessionPage.jsx`: extrair para uma seção `review`
- [x] 5.2 `src/pages/ProfilePage.jsx`: extrair para uma seção `profile` (incluindo `ThemeSelector`, `AccountForm`, `DeleteAccountForm`, `PasswordForm`)
- [x] 5.3 `src/pages/NotFoundPage.jsx`, `src/pages/DiagnosticsPage.jsx`, `src/routes.jsx`: extrair o texto restante (`routes.jsx` não tinha texto literal — só caminhos e componentes)
- [x] 5.4 Rodar `npm run lint` e `npm run build`, confirmar que passam sem erros

## 6. Escolha de idioma na tela de Perfil

- [x] 6.1 Em `ProfilePage.jsx`, adicionar `LanguageSelector` ao lado de `ThemeSelector` (mesmo padrão visual: botões "Português"/"English", `aria-pressed` na opção ativa; renomeada a classe CSS compartilhada `.profile-theme` para `.profile-options`, já que agora serve aos dois seletores), chamando `setLanguage` e atualizando o estado local ao clicar
- [x] 6.2 Testado manualmente (Chromium/Playwright, backend local): escolher "English" muda a interface inteira imediatamente sem recarregar (`Account`/`Theme`/`Language`/`Password`/`Data` na tela de Perfil); recarregar a página mantém "English" ativo (`lang="en-US"` no `<html>`); voltar para "Português" restaura o texto original ("Conta" volta a aparecer)
- [x] 6.3 Testado manualmente: com "English" ativo, criou-se um baralho com nome "Meu baralho pt" e idiomas "Português"/"Inglês" digitados no formulário — confirmado que esses valores aparecem inalterados em toda a interface em inglês (ex.: "Meu baralho pt · Português → Inglês"), sem nenhuma tradução automática

## 7. Atualizar convenção do projeto e verificação final

- [x] 7.1 Atualizar `openspec/config.yaml` (`context`): trocar "Textos de interface em português do Brasil" pela descrição de que a interface suporta português (padrão) e inglês, com a escolha na tela de Perfil
- [x] 7.2 Buscar por texto literal em português remanescente nos arquivos `.jsx` de `src/pages/` e `src/components/` (fora de comentários) para confirmar que nenhuma tela ficou sem migrar — nenhum texto de interface literal remanescente encontrado (só comentários, que continuam em português por convenção)
- [x] 7.3 Rodar `npm run lint` e `npm run build` no repositório inteiro e confirmar que passam sem erros
- [x] 7.4 Testado manualmente, ponta a ponta (Chromium/Playwright, backend e Postgres locais): fluxo completo com inglês ativo — cadastro, criação de baralho, tela de Perfil (`Account`/`Theme`/`Language`/`Password`/`Data`), detalhe de baralho (contagens, filtro de status, edição, suspender/reativar), criação de card com sugestão de dicionário, sessão de revisão (notas "Again"/"Hard"/"Good"/"Easy"), saída de sessão e nova entrada, Galeria, Diagnóstico e página 404 — todas em inglês, sem nenhum texto de interface em português por engano; sem erros no console do navegador
