## Context

Ver `proposal.md` para a motivação. Pontos relevantes do estado atual que
moldam a abordagem:

- `AuthProvider.jsx` já tem o padrão exato a seguir: `signIn({ email,
  password })` chama a API, grava a sessão em `tokenStore.setSession` e
  atualiza o estado — `signInWithGoogle(idToken)` repete esse mesmo padrão
  trocando só a chamada de API.
- `src/api/client.js` já envia `credentials: 'include'` incondicionalmente
  e já sabe lidar com qualquer endpoint que não use `auth: true` (a nova
  rota é pública, como `/auth/login`) — nenhuma mudança necessária ali.
- `src/config.js` já resolve configuração pública de ambiente (`VITE_*`)
  com um padrão embutido para quando a variável não é definida; o Client ID
  do Google segue o mesmo padrão, mas sem valor padrão (funcionalidade
  ausente, não uma URL alternativa).
- As telas de entrada e cadastro (`LoginPage.jsx`, `RegisterPage.jsx`) já
  compartilham `AuthScreen` como moldura e `useAuthForm` para estado de
  envio/erro — o botão do Google entra nessa mesma moldura, sem duplicar
  layout.

## Goals / Non-Goals

**Goals:**
- Obter um ID token do Google inteiramente no navegador (Google Identity
  Services), sem passar por um fluxo de redirecionamento gerenciado pela
  aplicação.
- Reaproveitar o mesmo caminho de gravação de sessão (`tokenStore`,
  `AuthContext`) que a entrada por credenciais já usa, para que qualquer
  outra parte do app (cabeçalho, rotas protegidas, renovação automática)
  funcione sem saber que a origem da sessão mudou.
- Degradar graciosamente quando a configuração do Google está ausente: a
  aplicação já roda hoje sem essa variável, e continuar rodando é o
  comportamento correto até ela ser configurada nos ambientes.

**Non-Goals:**
- Mostrar o próprio One Tap do Google (prompt automático na abertura da
  página) — só o botão explícito nas telas de entrada e cadastro.
- Fluxo de vinculação/desvinculação manual de conta Google numa tela de
  perfil separada — o backend já vincula automaticamente por e-mail
  verificado; não há ação do usuário a expor aqui.
- Estilizar o botão do próprio Google pixel a pixel com os componentes do
  design system — a biblioteca do Google renderiza seu próprio botão (com
  opções de tema claro/escuro/contorno); o design system entra no que o
  envolve (cartão, divisor, mensagens), não no botão em si.

## Decisions

### Biblioteca do Google carregada sob demanda, não em `index.html`

O script `https://accounts.google.com/gsi/client` é carregado
dinamicamente (uma tag `<script>` inserida por código) só quando uma tela
de entrada/cadastro monta e a configuração do Google está presente, em vez
de sempre em `index.html`. Alternativa descartada: sempre no
`index.html` — carregaria um script de terceiro em toda navegação da
aplicação, inclusive nas áreas autenticadas, sem necessidade.

### `signInWithGoogle` como nova operação de sessão, não uma opção de `signIn`

`AuthProvider` ganha `signInWithGoogle(idToken)` como função própria, e não
um parâmetro alternativo de `signIn`. Os dois têm contrato de entrada
totalmente diferente (credenciais vs. ID token) e o mesmo formato de
resultado; forçar os dois num único `signIn` exigiria um parâmetro
"modo" sem ganho real de simplicidade.

### Botão do Google como componente próprio, reaproveitado por login e cadastro

Um componente (`GoogleSignInButton`, ou nome equivalente) encapsula
carregar o script, inicializar `google.accounts.id` com o Client ID de
`src/config.js`, renderizar o botão e repassar o `credential` (ID token)
recebido a uma prop `onSuccess`. `LoginPage` e `RegisterPage` só passam
`onSuccess={signInWithGoogle}` (ou equivalente com tratamento de erro) —
nenhuma delas conhece a API do Google diretamente.

### Ausência de `VITE_GOOGLE_CLIENT_ID` desliga o botão, não é erro

Igual ao padrão já usado para `VITE_API_URL`: uma variável de ambiente
pública ausente não deveria derrubar a aplicação. Aqui a analogia não é
"usar um padrão embutido" (não existe Client ID padrão possível) e sim
"a funcionalidade correspondente simplesmente não aparece" — o botão do
Google não é renderizado, e nada mais na tela muda.

## Risks / Trade-offs

- [Risco] O script do Google pode falhar ao carregar (rede, bloqueador de
  terceiros) depois de a tela já ter decidido mostrar o botão →
  Mitigação: o carregamento dinâmico trata a falha de carregar o script
  como a mesma falha "Google indisponível" do spec, sem quebrar o resto da
  tela.
- [Risco] Divergência entre o Client ID configurado no frontend
  (`VITE_GOOGLE_CLIENT_ID`) e o configurado no backend (`GOOGLE_CLIENT_ID`)
  faria todo login com Google falhar com erro genérico do backend →
  Mitigação: nenhuma automática no código; documentar em `README.md` que os
  dois valores SHALL ser o mesmo Client ID, ao lado de onde `VITE_API_URL`
  já é documentado.
- [Trade-off] O botão renderizado pela biblioteca do Google não segue
  exatamente os tokens visuais do design system → aceito: é o padrão
  esperado por quem usa "Entrar com o Google" em qualquer site, e replicar
  o botão do zero introduziria um risco de conformidade com as diretrizes
  de marca do Google.
