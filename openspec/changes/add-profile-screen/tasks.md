## 1. Camada de API

- [ ] 1.1 Adicionar `updateUser(id, input)` a `src/api/users.js`, via
      `request(path, { method: 'PATCH', auth: true, body: input })` —
      verificar por leitura que não usa URL literal, só `API_URL` (via
      `client.js`).

## 2. Sessão: operação de editar perfil

- [ ] 2.1 Em `src/auth/AuthProvider.jsx`, adicionar `updateProfile(input)`
      ao contexto: chama `usersApi.updateUser(state.user.id, input)`,
      atualiza `state.user` e `tokenStore.setUser(...)` com o usuário
      devolvido, e devolve esse usuário a quem chamou — mesmo par
      estado+depósito que `signIn` já mantém. Falha SHALL NOT alterar o
      estado — verificar por leitura que a atualização só acontece após o
      `await` da chamada ter sucesso.
- [ ] 2.2 Exportar `updateProfile` no valor do contexto (`useMemo`) junto
      dos demais.

## 3. Tela de perfil

- [ ] 3.1 Criar `src/pages/ProfilePage.jsx` (+ `.css`): formulário de
      conta (nome, e-mail) pré-preenchido com `useAuth().user`, usando
      `useAuthForm` e as validações de `src/auth/validation.js`
      (`validateName`, `validateEmail`) — verificar que os valores atuais
      aparecem nos campos ao abrir a tela.
- [ ] 3.2 Envio do formulário de conta chama `updateProfile({ name,
      email })` — verificar que uma edição bem-sucedida atualiza o que a
      tela exibe e o que `AuthenticatedLayout` exibe no cabeçalho, sem
      recarregar a página.
- [ ] 3.3 Botão "Trocar senha" revela um formulário próprio (senha atual,
      nova senha, Salvar, Cancelar), usando `validateCurrentPassword` e
      `validateNewPassword` — verificar que os campos de nota não
      aparecem antes de acionar o botão, e que "Cancelar" oculta o
      formulário sem enviar requisição.
- [ ] 3.4 Envio do formulário de senha chama `updateProfile({ password,
      currentPassword })`; sucesso exibe confirmação e oculta o
      formulário de novo — verificar que a sessão atual continua ativa
      logo depois (nenhuma saída forçada).
- [ ] 3.5 Recusa do backend (e-mail duplicado, senha atual incorreta)
      exibida como erro geral ou por campo, conforme o backend indicar —
      verificar os dois casos manualmente.

## 4. Link de acesso

- [ ] 4.1 Em `src/components/AuthenticatedLayout.jsx`, adicionar um link
      para `/perfil`, alcançável junto de onde já se alcança "Sair" —
      verificar visualmente que aparece em qualquer tela protegida.

## 5. Rotas

- [ ] 5.1 Adicionar a rota protegida `/perfil` em `src/routes.jsx`, no
      mesmo grupo de `RequireAuth`/`AuthenticatedLayout` — verificar que
      abrir a URL diretamente funciona com sessão ativa, e redireciona
      para `/entrar` sem sessão.

## 6. Verificação de build e lint

- [ ] 6.1 `npm run build` sem erro.
- [ ] 6.2 `npm run lint` sem aviso.

## 7. Verificação manual ponta a ponta

- [ ] 7.1 Contra o backend local (Postgres local): editar nome e e-mail e
      confirmar que o cabeçalho reflete a mudança sem recarregar; tentar
      um e-mail já usado por outra conta (criada à parte) e confirmar a
      recusa atribuída ao campo; trocar a senha com a senha atual correta
      e confirmar sucesso; trocar com a senha atual errada e confirmar a
      recusa; confirmar que, em nenhum dos casos de senha, a sessão atual
      é encerrada imediatamente.
- [ ] 7.2 Confirmar visualmente os dois temas (claro/escuro) na tela nova.

## 8. Verificação final

- [ ] 8.1 `openspec validate --specs` passa para `account/profile-screen`
      e `auth/session`.
