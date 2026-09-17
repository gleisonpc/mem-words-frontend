## 1. Camada de API

- [x] 1.1 Adicionar `updateUser(id, input)` a `src/api/users.js`, via
      `request(path, { method: 'PATCH', auth: true, body: input })` —
      verificado por leitura que não usa URL literal, só `API_URL` (via
      `client.js`).

## 2. Sessão: operação de editar perfil

- [x] 2.1 Em `src/auth/AuthProvider.jsx`, adicionar `updateProfile(input)`
      ao contexto: chama `usersApi.updateUser(state.user.id, input)`,
      atualiza `state.user` e `tokenStore.setUser(...)` com o usuário
      devolvido, e devolve esse usuário a quem chamou — mesmo par
      estado+depósito que `signIn` já mantém. Falha SHALL NOT alterar o
      estado — confirmado por leitura que a atualização só acontece após
      o `await` da chamada ter sucesso, e verificado com Playwright que
      uma recusa (e-mail duplicado, senha atual incorreta) deixa o
      cabeçalho e os campos inalterados.
- [x] 2.2 Exportar `updateProfile` no valor do contexto (`useMemo`) junto
      dos demais.

## 3. Tela de perfil

- [x] 3.1 Criar `src/pages/ProfilePage.jsx` (+ `.css`): formulário de
      conta (nome, e-mail) pré-preenchido com `useAuth().user`, usando
      `useAuthForm` e as validações de `src/auth/validation.js`
      (`validateName`, `validateEmail`) — verificado com Playwright que
      os valores atuais aparecem nos campos ao abrir a tela.
- [x] 3.2 Envio do formulário de conta chama `updateProfile({ name,
      email })` — verificado que uma edição bem-sucedida atualiza o que a
      tela exibe e o que `AuthenticatedLayout` exibe no cabeçalho, sem
      recarregar a página.
- [x] 3.3 Botão "Trocar senha" revela um formulário próprio (senha atual,
      nova senha, Salvar, Cancelar), usando `validateCurrentPassword` e
      `validateNewPassword` — verificado que os campos não aparecem antes
      de acionar o botão (0 campos), aparecem depois (1+), e que
      "Cancelar" oculta o formulário de volta sem enviar requisição.
- [x] 3.4 Envio do formulário de senha chama `updateProfile({ password,
      currentPassword })`; sucesso exibe confirmação ("Senha alterada.")
      e oculta o formulário de novo — verificado com navegação
      client-side (sem recarregar) que a sessão atual continua ativa
      logo depois: nenhuma saída forçada, a lista de baralhos continua
      acessível sem passar por `/entrar`.
- [x] 3.5 Recusa do backend exibida corretamente nos dois casos testados:
      e-mail já usado por outra conta (erro geral, o backend não indica
      campo) e senha atual incorreta (erro geral do formulário de senha,
      "Senha atual incorreta.") — em nenhum dos dois o cabeçalho ou os
      dados mudam.

## 4. Link de acesso

- [x] 4.1 Em `src/components/AuthenticatedLayout.jsx`, o nome/e-mail do
      usuário no cabeçalho virou o próprio link para `/perfil` (em vez de
      um elemento novo) — verificado clicando nele a partir da tela
      inicial.

## 5. Rotas

- [x] 5.1 Adicionar a rota protegida `/perfil` em `src/routes.jsx`, no
      mesmo grupo de `RequireAuth`/`AuthenticatedLayout` — verificado que
      o link do cabeçalho leva até ela com sessão ativa.

## 6. Verificação de build e lint

- [x] 6.1 `npm run build` sem erro.
- [x] 6.2 `npm run lint` sem aviso.

## 7. Verificação manual ponta a ponta

- [x] 7.1 Contra o backend local (Postgres local), com Playwright: editar
      nome e e-mail e confirmar que o cabeçalho reflete a mudança sem
      recarregar; tentar um e-mail já usado por outra conta (criada à
      parte) e confirmar a recusa; trocar a senha com a senha atual
      correta e confirmar sucesso; trocar com a senha atual errada e
      confirmar a recusa; confirmado, com navegação client-side (sem
      `page.goto` — que sempre zera o token de acesso em memória,
      independente de qualquer troca de senha, e não seria um teste
      justo), que a sessão não é encerrada como efeito direto da troca.
- [x] 7.2 Confirmado visualmente nos dois temas (claro/escuro): os dois
      cartões (Conta, Senha) com o formulário de senha revelado —
      legível nos dois.

## 8. Verificação final

- [x] 8.1 `openspec validate --specs` passa para `account/profile-screen`
      e `auth/session`.
