## Why

O token de renovação — de vida longa (7 dias), capaz de gerar sessões novas
indefinidamente enquanto não é revogado — hoje vive em `localStorage`,
alcançável por qualquer XSS no frontend. Essa lacuna foi registrada como
pendência já na proposta que introduziu a autenticação, à espera de o backend
poder restringir CORS a uma origem específica — pré-requisito de um cookie
entre origens diferentes.

O backend (mudança correspondente, PR próprio) passa a entregar e exigir o
token de renovação por cookie `HttpOnly`, `Secure`, `SameSite=None`: o
navegador guarda e envia o cookie sozinho, e nenhum JavaScript — legítimo ou
injetado — consegue lê-lo. Este é o lado do frontend dessa migração: parar de
guardar e enviar manualmente algo que o navegador já resolve sozinho.

## What Changes

- O frontend **deixa de guardar o token de renovação em qualquer lugar**: nem
  em `localStorage`, nem em variável. Ele nunca mais existe como valor que o
  JavaScript da aplicação manipula.
- O token de acesso **deixa de ser persistido em `localStorage`** e passa a
  viver só em memória, pelo tempo em que a aba estiver aberta. Guardar o
  token de acesso não fazia mal por si (vida curta, 15 minutos), mas mantê-lo
  em `localStorage` enquanto o objetivo desta mudança é reduzir superfície de
  XSS seria deixar a metade mais fácil de corrigir sem corrigir.
- O que persiste em `localStorage` passa a ser só uma dica não sensível — que
  uma sessão foi iniciada antes, e o usuário guardado para exibição — usada
  para decidir, na abertura da aplicação, se vale tentar renovar a sessão
  pelo cookie antes de assumir "sem sessão".
- Toda chamada ao backend passa a incluir credenciais (`credentials:
  'include'`), necessário para o navegador enviar e receber o cookie
  entre as duas origens (Vercel e Render).
- `POST /auth/logout` deixa de enviar `refreshToken` no corpo — não há mais
  nada para enviar; o cookie viaja sozinho.

Nenhuma mudança visível para quem usa a aplicação: a sessão continua
sobrevivendo a recarregar a página, a renovação automática continua
funcionando, o comportamento de sair continua o mesmo. O que muda é onde a
informação sensível mora — de um lugar que JavaScript lê para um que só o
navegador toca.

**Corte direto**, coordenado com a mudança do backend: depois que o backend
publicado exigir o cookie, esta versão do frontend é a que sabe usá-lo. A
versão anterior do frontend, com o backend novo, quebraria a renovação de
sessão — por isso as duas mudanças precisam ser publicadas em sequência
próxima, aceitando a janela de sessões derrubadas já registrada na mudança do
backend.

## Capabilities

### Modified Capabilities

- `auth/session`: onde a sessão guarda o que precisa guardar, o que persiste
  entre recargas, e como a restauração e a renovação obtêm um token de acesso
  novo — tudo girando em torno de não haver mais token de renovação
  manipulável pelo frontend.

## Impact

**Código afetado**

- `src/auth/tokenStore.js` — deixa de guardar `refreshToken`; o token de
  acesso sai de `localStorage` e passa a existir só em memória; o que
  persiste é a dica de sessão e o usuário para exibição.
- `src/api/client.js` — `credentials: 'include'` em toda requisição;
  `performRenewal` não lê mais um token de renovação local (não existe um) —
  a chamada de renovação depende só do cookie que o navegador já anexa.
- `src/api/auth.js` — `logout` deixa de receber e enviar `refreshToken`.
- `src/auth/AuthProvider.jsx` — `signIn`/`signOut` param de `refreshToken`
  removido; a checagem que decide se há sessão a confirmar na abertura passa
  a usar a dica de sessão, não a presença de tokens.

**Sem impacto**

- Nenhuma dependência nova.
- `src/routes.jsx`, `RequireAuth`/`GuestOnly`, as telas de entrada e cadastro:
  todos consomem o contexto de sessão, não os tokens diretamente — nada muda
  para eles.
- O mecanismo de renovação de disparo único (uma promessa em curso) continua
  igual: a mudança é sobre *o que* é lido para decidir renovar, não sobre
  *como* a concorrência é evitada.

**Ponto que merece decisão explícita na revisão**

Mover o token de acesso para memória-apenas significa que toda abertura de
aplicação com uma sessão anterior faz uma chamada de renovação antes de
confirmar a sessão — mesmo que o token de acesso guardado ainda estivesse
válido, porque ele não existe mais entre recargas. Isso troca uma
possibilidade de restauração instantânea por uma garantia mais forte de que
nenhum token de longa duração fica em `localStorage`. A dica de sessão evita
o custo para quem nunca fez login: só quem já autenticou alguma vez paga essa
chamada extra.
