## Context

Ver `proposal.md` — Why para a motivação, e `design.md` da mudança
correspondente no backend (`move-refresh-token-to-httponly-cookie`) para o
lado do servidor. Resumo do que já está lá: o backend emite e exige o token
de renovação por cookie `HttpOnly; Secure; SameSite=None; Path=/auth`, com
CORS restrito a origens específicas e `credentials: true` só nesse modo.

Estado atual relevante no frontend:

- `src/auth/tokenStore.js` guarda `{ accessToken, refreshToken, user }` em
  `localStorage`, com espelho em memória.
- `src/api/client.js#attempt` não envia `credentials` no `fetch` — sem cookie
  algum indo ou vindo hoje.
- `performRenewal` lê `tokenStore.getRefreshToken()` e só tenta renovar se
  houver um valor guardado; a chamada envia `{ refreshToken }` no corpo de
  `/auth/refresh`.
- `AuthProvider.jsx#initialState` decide "determinando" vs. "sem sessão" com
  base em `tokenStore.hasTokens()`; a confirmação de sessão chama
  `usersApi.getMe()` (`auth: true`), que já dispara renovação automática por
  `401` via o mecanismo existente em `client.js`.

Essa última peça é o que torna esta migração pequena: o mecanismo de
"requisição autenticada recusada por 401 → renovar → repetir" já existe e já
é exatamente o que uma inicialização com token de acesso inexistente
precisa. Não é preciso ensinar `AuthProvider` a chamar `/auth/refresh`
explicitamente antes de `getMe()` — um `getMe()` sem token de acesso em
memória já produz o 401 que aciona o mecanismo.

## Goals / Non-Goals

**Goals:**

- Nenhum token — de acesso ou de renovação — em `localStorage` ou em
  qualquer lugar que `document.cookie`/JavaScript alcance.
- Reaproveitar o mecanismo de renovação reativa já existente, em vez de
  duplicar lógica de obtenção de token na inicialização.
- Nenhuma dependência nova.

**Non-Goals:**

- Sincronizar a sessão entre abas por evento de `storage` — mudança
  independente, já registrada como pendência anterior a esta.
- Mudar o comportamento observável pelas telas: `useAuth()` continua
  devolvendo os mesmos estados, pelas mesmas transições.

## Decisions

### Token de acesso só em memória, não em `localStorage`

Se o objetivo é reduzir o que um XSS alcança, deixar o token de acesso em
`localStorage` enquanto o de renovação sai de lá resolveria só metade do
problema por comodidade. O token de acesso tem vida curta (15 min) e valor
menor para um atacante, mas "menor" não é "zero" — um XSS que rode durante
essa janela ainda o alcançaria se ele estivesse em `localStorage`.

*Alternativa considerada:* manter o token de acesso em `localStorage`,
migrando só o de renovação. Rejeitada: seria a correção mais barata, mas
deixaria pela metade o problema que esta mudança existe para resolver.

### Uma dica não sensível substitui a checagem de tokens guardados

Sem token algum em `localStorage`, a aplicação não tem como saber, sem uma
chamada de rede, se há uma sessão para restaurar. Sem alguma pista, toda
abertura de aplicação — inclusive de quem nunca fez login — pagaria uma
chamada a `/auth/refresh` fadada a falhar.

A dica é um valor não sensível (`{ hasSession: true, user }`, sem token
algum) gravado no login e removido no logout. Ler esse valor não dá a um
atacante nada que ele já não descobriria tentando a chamada de renovação
diretamente — ele não prova sessão válida, só sinaliza que vale tentar.

*Alternativa considerada:* sempre tentar renovar na abertura, sem dica
nenhuma. Rejeitada: penaliza com uma chamada de rede desnecessária o caso
mais comum de visita — quem nunca autenticou.

### Reaproveitar o 401 reativo em vez de renovar explicitamente na abertura

Com o token de acesso em memória zerado a cada carregamento de página, a
primeira chamada autenticada (`getMe()`, na confirmação de sessão) já sai
sem `Authorization` — o backend responde `401` do mesmo jeito que responderia
a um token expirado, e o `catch` de `request()` em `client.js` já dispara
`renewTokens()` e repete. Nenhuma mudança de fluxo é necessária em
`AuthProvider`; a mudança está inteiramente em `tokenStore` deixar de ter um
token de acesso para entregar.

*Alternativa considerada:* `AuthProvider` chamar `authApi.refresh()`
explicitamente antes de `getMe()` na inicialização. Rejeitada: duplicaria,
com outras palavras, o que `request()` já faz ao tratar um `401` — dois
lugares decidindo quando renovar é mais superfície para os dois
divergirem.

### `credentials: 'include'` em toda requisição, não seletivo por rota

`attempt()` é o único ponto de saída ao backend. Decidir credenciais por
rota exigiria que cada chamador soubesse se sua rota depende de cookie —
`/auth/refresh` e `/auth/logout` dependem; as demais não fariam mal
nenhum ao incluir, já que um `fetch` com `credentials: 'include'` para uma
rota que não lê nem grava cookie simplesmente não tem efeito. Um único
caminho, sempre igual, é mais simples de raciocinar que uma exceção por
rota.

## Risks / Trade-offs

- **Toda abertura com sessão anterior faz uma chamada de rede a mais** (a
  renovação, antes de confirmar) → Aceito: é o preço de não ter token algum
  em memória entre recargas. A dica de sessão evita pagar esse preço para
  quem nunca autenticou.
- **Sem testes automatizados**, a garantia de que nenhum token chega a
  `localStorage` é verificada manualmente, inspecionando o armazenamento no
  navegador após login, recarga e logout — roteiro registrado em
  `tasks.md`.
- **Dependência de ordem de deploy com o backend** — ver "Migration Plan" no
  design do backend; esta mudança só funciona depois que o backend publicado
  já exigir o cookie.

## Migration Plan

Este é o segundo dos dois PRs do corte direto (ver design do backend). Só
deve ser publicado depois que o PR do backend estiver mergeado e implantado
— antes disso, este frontend chamaria `/auth/refresh` sem enviar
`refreshToken` no corpo (não há mais nada para enviar) contra um backend
ainda esperando o formato antigo, e a renovação falharia sempre.

Reversão: `git revert` do commit. Sem estado persistido que precise de
migração — o pior caso de reverter cedo demais é forçar um novo login.
