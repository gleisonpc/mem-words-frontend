## 1. API e sessão

- [ ] 1.1 Em `src/api/users.js`, adicionar `deleteUser(id, { currentPassword })`
      — `DELETE /users/:id` com o corpo, exigido pelo backend a partir de
      `require-password-for-account-deletion`.
- [ ] 1.2 Em `src/auth/tokenStore.js`, adicionar o motivo de encerramento
      `ACCOUNT_DELETED`, exportado ao lado de `LOGOUT` e `SESSION_EXPIRED`.
- [ ] 1.3 Em `src/auth/AuthProvider.jsx`, adicionar `deleteAccount(currentPassword)`:
      chama `usersApi.deleteUser`, e só em caso de sucesso encerra a sessão
      com `tokenStore.clear(tokenStore.ACCOUNT_DELETED)` e dispara
      `authApi.logout()` sem aguardar (erro engolido, como `signOut`).
- [ ] 1.4 No ouvinte de encerramento de `AuthProvider`, tratar
      `ACCOUNT_DELETED` como saída pedida pela pessoa (`signedOut: true`,
      como `LOGOUT`) e definir um aviso de sucesso próprio ("Sua conta foi
      excluída."), distinto do aviso de sessão expirada.
- [ ] 1.5 Expor `deleteAccount` no valor do contexto de autenticação.

## 2. Formulário na tela de perfil

- [ ] 2.1 Em `src/pages/ProfilePage.jsx`, adicionar a seção "Dados" com o
      botão "Excluir conta", revelando um formulário embutido (mesmo padrão
      de "Trocar senha": nenhum modal) com aviso da irreversibilidade e um
      campo de senha atual.
- [ ] 2.2 Validar a senha atual no cliente antes de enviar (reaproveitar
      `validateCurrentPassword`), sem gerar requisição quando vazia.
- [ ] 2.3 Confirmar com sucesso: nenhuma ação local extra é necessária além
      de chamar `deleteAccount` — a troca de tela para `/entrar` já vem de
      `RequireAuth` reagindo ao novo estado `ANONYMOUS`.
- [ ] 2.4 Senha incorreta: erro geral exibido no formulário, formulário
      continua visível, sessão permanece ativa.
- [ ] 2.5 Cancelar: formulário volta a ficar oculto, sem requisição.

## 3. Verificação de build e lint

- [ ] 3.1 `npm run build` sem erro.
- [ ] 3.2 `npm run lint` sem aviso.

## 4. Verificação manual ponta a ponta

- [ ] 4.1 Contra o backend local com `require-password-for-account-deletion`
      aplicado: excluir sem preencher a senha não envia requisição (campo
      inválido); com senha errada, erro exibido e a tela de perfil continua
      acessível com a mesma sessão; com a senha correta, a aplicação leva à
      tela de entrada mostrando "Sua conta foi excluída.", e uma tentativa
      de acessar `/perfil` diretamente (URL) redireciona para `/entrar` sem
      guardar destino de retorno.
- [ ] 4.2 Confirmar que os dados da conta excluída realmente somem no
      backend (a mesma verificação de cascata já feita no change do
      backend cobre isso — não repetir aqui, só confirmar pela UI que a
      sessão não permanece).

## 5. Verificação final

- [ ] 5.1 `openspec validate --specs` passa para `account/profile-screen`.
