## Why

O backend (`mem-words-backend`, change `add-google-sign-in`) está ganhando
`POST /auth/google`, uma forma de autenticar sem senha via Google. Sem uma
tela e um fluxo no frontend para obter o ID token do Google e apresentá-lo
a essa rota, a capacidade não chega a quem usa o aplicativo. O objetivo é
oferecer "Entrar com o Google" como atalho nas telas de entrada e cadastro,
ao lado do formulário de e-mail e senha já existente — não em substituição
a ele.

## What Changes

- Carregamento do script do Google Identity Services (GIS) e um botão
  "Entrar com o Google" nas telas de entrada (`/entrar`) e de cadastro
  (`/cadastro`), lado a lado com o formulário de e-mail/senha existente,
  separado por um divisor visual ("ou").
- Ao concluir o fluxo do Google no navegador, o ID token recebido é
  enviado a `POST /auth/google`; sucesso autentica a pessoa exatamente como
  `signIn` já faz hoje — mesmo estado de sessão, mesmo token de acesso em
  memória, mesma dica de sessão persistida, sem exigir nenhum dado adicional
  de quem está entrando.
- Uma única operação de sessão (`signInWithGoogle`) atende tanto quem já
  tem conta quanto quem está criando uma pela primeira vez — o backend
  decide, pelo e-mail verificado do Google, se cria conta nova ou vincula a
  uma existente; o frontend não precisa saber qual dos dois aconteceu.
- Nova variável de ambiente pública `VITE_GOOGLE_CLIENT_ID` (o Client ID
  OAuth 2.0 Web do Google Cloud Console — o mesmo configurado no backend),
  com padrão embutido inexistente: sem ela, o botão do Google não é
  exibido, e o restante da tela de entrada/cadastro continua funcionando
  normalmente.
- Tratamento de falha do próprio Google (script bloqueado, popup fechado,
  origem não autorizada) como uma falha comum do formulário — mensagem
  geral, sem travar a tela nem impedir o uso do formulário de e-mail/senha.

## Capabilities

### New Capabilities

(nenhuma — esta change estende `auth/session` e `auth/screens`, não
introduz uma capability nova)

### Modified Capabilities

- `auth/session`: adiciona a operação de entrar com um ID token do Google
  como forma alternativa de autenticar, com o mesmo contrato de estado
  (sessão determinando/autenticada/anônima) já usado pela entrada por
  credenciais.
- `auth/screens`: adiciona o botão "Entrar com o Google" às telas de
  entrada e cadastro, e como suas falhas específicas (indisponibilidade do
  Google, cancelamento pelo usuário) são comunicadas sem se confundir com
  as falhas do formulário de credenciais.

## Impact

- `index.html` ou carregamento dinâmico: script `https://accounts.google.com/gsi/client`.
- `src/config.js`: nova constante lida de `VITE_GOOGLE_CLIENT_ID`.
- `src/api/auth.js`: nova função `loginWithGoogle({ idToken })`.
- `src/auth/AuthProvider.jsx`, `src/auth/session.js`: nova operação
  `signInWithGoogle` exposta por `useAuth()`.
- Novo componente (ex.: `src/auth/GoogleSignInButton.jsx`) reaproveitado
  por `LoginPage.jsx` e `RegisterPage.jsx`.
- `src/i18n/dictionaries/pt.js` e `en.js`: textos novos (rótulo do botão,
  divisor "ou", mensagens de falha do Google).
- `.env.example`, `README.md`: documentar `VITE_GOOGLE_CLIENT_ID`.
- Nenhuma mudança em `src/api/client.js`, `src/auth/tokenStore.js` (a
  gravação da sessão é idêntica à de `signIn`) nem nas rotas existentes.
