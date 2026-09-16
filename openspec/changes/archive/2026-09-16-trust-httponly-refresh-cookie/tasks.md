## 1. Depósito da sessão

- [x] 1.1 Em `tokenStore.js`, remover `refreshToken` de tudo — do estado em
      memória, do que é gravado e do que é lido de `localStorage`; verificar
      por busca no arquivo que a string `refreshToken` não aparece mais.
- [x] 1.2 O token de acesso passa a existir só na variável em memória; a
      função `persist()` grava apenas `{ hasSession: true, user }`; verificar
      inspecionando `localStorage.getItem('mem-words.auth')` no navegador que
      ele nunca contém `accessToken` nem `refreshToken`.
- [x] 1.3 Renomear `hasTokens()` para `hasSessionHint()` (ou nome equivalente
      que não sugira token) e `setSession`/`setTokens` para não receberem
      `refreshToken`; remover `getRefreshToken()` inteiramente; verificar por
      busca no projeto que nenhum chamador restante depende das assinaturas
      antigas.
- [x] 1.4 Atualizar os comentários do arquivo que descrevem o que é guardado
      e por quê, já que a motivação de "quebrar o ciclo de import" continua
      válida mas o conteúdo guardado mudou.

## 2. Cliente HTTP

- [x] 2.1 Em `client.js#attempt`, adicionar `credentials: 'include'` à
      chamada de `fetch`; verificar que a opção está presente
      incondicionalmente, não só nas rotas de autenticação.
- [x] 2.2 Em `performRenewal`, remover a leitura de
      `tokenStore.getRefreshToken()` e a checagem de token ausente antes de
      tentar — a chamada a `/auth/refresh` depende só do cookie que o
      navegador já anexa; verificar que a função chama `attempt('/auth/refresh',
      ...)` sem enviar corpo.
- [x] 2.3 Ajustar o resultado da renovação para gravar só o token de acesso
      (`tokenStore.setTokens({ accessToken })` ou equivalente atualizado pela
      tarefa 1.3); verificar que o corpo esperado da resposta de
      `/auth/refresh` não inclui mais `refreshToken`.

## 3. Operações de autenticação

- [x] 3.1 Em `api/auth.js#logout`, remover o parâmetro `refreshToken` e o
      envio de corpo na chamada a `/auth/logout`; verificar que a função não
      recebe mais argumento algum.

## 4. Provedor de sessão

- [x] 4.1 Em `AuthProvider.jsx#initialState` e no guarda do efeito de
      restauração, trocar `tokenStore.hasTokens()` por
      `tokenStore.hasSessionHint()` (nome definido na tarefa 1.3); verificar
      que o comportamento de "determinando" vs. "sem sessão" na abertura
      continua correto.
- [x] 4.2 Em `signIn`, parar de desestruturar e guardar `refreshToken` —
      guardar só `{ accessToken, user }`; verificar que a assinatura de
      `tokenStore.setSession` chamada aqui bate com a da tarefa 1.3.
- [x] 4.3 Em `signOut`, remover a leitura de `tokenStore.getRefreshToken()` e
      chamar `authApi.logout()` sem argumento; verificar que a chamada
      continua sendo disparada sem aguardar (fire-and-forget) como antes.

## 5. Verificação manual do fluxo completo

- [x] 5.1 Contra o backend já migrado (rodando localmente com o cookie),
      fazer cadastro, entrada, recarregar a página e sair pela interface;
      verificar em cada passo, pelas ferramentas de desenvolvedor do
      navegador, que `localStorage` nunca contém `accessToken` nem
      `refreshToken` — só a dica de sessão e o usuário.
- [x] 5.2 Confirmar na aba de rede que toda chamada ao backend inclui o
      cookie (quando presente) e que `/auth/refresh` e `/auth/logout` não
      enviam corpo algum.
- [x] 5.3 Recarregar a página com sessão ativa e confirmar que a aplicação
      passa por "determinando" e chega a autenticada sem pedir login de
      novo, mesmo com o token de acesso em memória zerado pela recarga.
- [x] 5.4 Abrir a aplicação em uma aba anônima (sem sessão anterior) e
      confirmar, pela aba de rede, que nenhuma chamada a `/auth/refresh` é
      feita — a dica de sessão ausente evita a tentativa.
- [x] 5.5 Forçar uma renovação (esperar o token de acesso expirar ou reduzir
      `JWT_ACCESS_EXPIRES_IN` no backend local) e confirmar que uma chamada
      autenticada dispara renovação e repetição, transparente para a tela.
- [x] 5.6 Sair pela interface e confirmar que a dica de sessão e o usuário
      são removidos de `localStorage`, e que uma tentativa seguinte de
      renovação (recarregar a página) trata a ausência de cookie como sessão
      inexistente, sem erro.

## 6. Verificação final

- [x] 6.1 Rodar `npm run lint` e `npm run build`; verificar que ambos passam
      sem aviso.
- [x] 6.2 Confirmar que nenhuma dependência foi adicionada; verificar que
      `package.json` não mudou.
- [x] 6.3 Rodar `openspec validate --specs` e confirmar que `auth/session`
      passa.
