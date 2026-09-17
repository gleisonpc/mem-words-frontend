## 1. API e sessão

- [x] 1.1 Em `src/api/users.js`, adicionar `deleteUser(id, { currentPassword })`
      — `DELETE /users/:id` com o corpo, exigido pelo backend a partir de
      `require-password-for-account-deletion`.
- [x] 1.2 Em `src/auth/tokenStore.js`, adicionar o motivo de encerramento
      `ACCOUNT_DELETED`, exportado ao lado de `LOGOUT` e `SESSION_EXPIRED`.
- [x] 1.3 Em `src/auth/AuthProvider.jsx`, adicionar `deleteAccount(currentPassword)`:
      chama `usersApi.deleteUser`, e só em caso de sucesso encerra a sessão
      com `tokenStore.clear(tokenStore.ACCOUNT_DELETED)` e dispara
      `authApi.logout()` sem aguardar (erro engolido, como `signOut`).
- [x] 1.4 No ouvinte de encerramento de `AuthProvider`, tratar
      `ACCOUNT_DELETED` como saída pedida pela pessoa (`signedOut: true`,
      como `LOGOUT`) e definir um aviso de sucesso próprio ("Sua conta foi
      excluída."), distinto do aviso de sessão expirada.
- [x] 1.5 Expor `deleteAccount` no valor do contexto de autenticação.

## 2. Formulário na tela de perfil

- [x] 2.1 Em `src/pages/ProfilePage.jsx`, adicionar a seção "Dados" com o
      botão "Excluir conta", revelando um formulário embutido (mesmo padrão
      de "Trocar senha": nenhum modal) com aviso da irreversibilidade e um
      campo de senha atual.
- [x] 2.2 Validar a senha atual no cliente antes de enviar (reaproveitar
      `validateCurrentPassword`), sem gerar requisição quando vazia.
- [x] 2.3 Confirmar com sucesso: nenhuma ação local extra é necessária além
      de chamar `deleteAccount` — a troca de tela para `/entrar` já vem de
      `RequireAuth` reagindo ao novo estado `ANONYMOUS`.
- [x] 2.4 Senha incorreta: erro geral exibido no formulário, formulário
      continua visível, sessão permanece ativa.
- [x] 2.5 Cancelar: formulário volta a ficar oculto, sem requisição.

## 3. Verificação de build e lint

- [x] 3.1 `npm run build` sem erro.
- [x] 3.2 `npm run lint` sem aviso.

## 4. Verificação manual ponta a ponta

- [x] 4.1 Contra o backend local com `require-password-for-account-deletion`
      aplicado: verificado via Playwright
      (`/tmp/pw-check/verify-delete-account.mjs`) — cancelar oculta o
      formulário sem requisição, com a sessão intacta; enviar sem senha não
      chama `DELETE` e marca o campo inválido; senha errada responde `401`,
      exibe "Senha atual incorreta." como erro geral no formulário, e a
      sessão sobrevive a um reload (`GET /users/me` continua autenticando);
      senha correta responde `204`, leva a `/entrar` com o aviso "Sua conta
      foi excluída.", e uma tentativa seguinte de acessar `/perfil`
      diretamente pela URL volta para `/entrar` (sem guardar destino de
      retorno, confirmando `signedOut: true` para este motivo). Também
      capturadas telas da seção "Dados" recolhida e expandida, nos dois
      temas (claro/escuro) — sem regressão visual.
- [x] 4.2 Confirmar que os dados da conta excluída realmente somem no
      backend (a mesma verificação de cascata já feita no change do
      backend cobre isso — não repetir aqui, só confirmar pela UI que a
      sessão não permanece). Confirmado pela UI: `/perfil` deixa de ser
      acessível com o token da conta excluída.

## 5. Verificação final

- [x] 5.1 `openspec validate --specs` passa para `account/profile-screen`.
