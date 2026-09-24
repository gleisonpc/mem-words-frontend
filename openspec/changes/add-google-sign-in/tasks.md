## 1. Configuração

- [ ] 1.1 Adicionar leitura de `VITE_GOOGLE_CLIENT_ID` em `src/config.js`, exportando `GOOGLE_CLIENT_ID` (string vazia quando ausente) e verificar no `/diagnostico` (ou console) que o valor aparece corretamente em desenvolvimento
- [ ] 1.2 Documentar `VITE_GOOGLE_CLIENT_ID` em `.env.example` e na seção de configuração do `README.md`, junto da observação de que deve ser o mesmo Client ID configurado no backend (`GOOGLE_CLIENT_ID`)

## 2. Cliente de API e sessão

- [ ] 2.1 Adicionar `loginWithGoogle({ idToken })` a `src/api/auth.js`, chamando `POST /auth/google` sem `auth: true` (rota pública), e verificar que devolve o mesmo formato de `{ user, accessToken, ... }` que `login`
- [ ] 2.2 Adicionar `signInWithGoogle(idToken)` a `src/auth/AuthProvider.jsx`, espelhando `signIn`: chama `authApi.loginWithGoogle`, grava a sessão com `tokenStore.setSession`, atualiza o estado para `AUTHENTICATED` e limpa o aviso pendente
- [ ] 2.3 Expor `signInWithGoogle` no valor do contexto (`useMemo` de `AuthProvider`) e verificar que `useAuth().signInWithGoogle` está disponível numa tela

## 3. Componente do botão do Google

- [ ] 3.1 Criar um módulo pequeno (ex.: `src/auth/googleIdentity.js`) que carrega `https://accounts.google.com/gsi/client` uma única vez (idempotente entre chamadas) e expõe uma função para inicializar `google.accounts.id` com um Client ID e um callback
- [ ] 3.2 Criar `src/auth/GoogleSignInButton.jsx`: usa o módulo acima com `GOOGLE_CLIENT_ID` de `src/config.js`, renderiza o botão do Google num contêiner, e chama as props `onSuccess(idToken)` / `onError(reason)` recebidas; não renderiza nada (sem erro) quando `GOOGLE_CLIENT_ID` está vazio
- [ ] 3.3 Verificar manualmente no navegador que o botão aparece, autentica com uma conta Google real e cai no fluxo de sucesso

## 4. Integração nas telas

- [ ] 4.1 Adicionar um divisor visual ("ou") e `GoogleSignInButton` a `LoginPage.jsx`, com `onSuccess` chamando `signInWithGoogle` e reportando erro pelo mesmo mecanismo de `generalError`/`Alert` que o formulário de credenciais já usa
- [ ] 4.2 Repetir a mesma integração em `RegisterPage.jsx`
- [ ] 4.3 Adicionar as strings novas (rótulo do divisor, mensagem de falha do Google) a `src/i18n/dictionaries/pt.js` e `en.js`
- [ ] 4.4 Verificar visualmente as duas telas nos temas claro e escuro, com e sem `VITE_GOOGLE_CLIENT_ID` definida

## 5. Validação da change

- [ ] 5.1 Rodar `npm run lint` e verificar que passa sem erros
- [ ] 5.2 Rodar `npm run build` e verificar que o build conclui sem erros
- [ ] 5.3 Testar manualmente, apontando para um backend com `add-google-sign-in` já implementado, os cenários dos specs: entrada com Google bem-sucedida (conta nova e conta já existente por e-mail), cancelamento do fluxo do Google, e recusa do backend ao ID token
- [ ] 5.4 Rodar `openspec validate add-google-sign-in --strict` e verificar que a change passa
