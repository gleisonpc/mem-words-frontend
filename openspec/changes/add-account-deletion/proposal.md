## Why

O mockup do perfil prevê, na seção "Dados", excluir a conta — a última peça
pendente do mockup original (as outras, exportar `.csv` e importar `.apkg`,
seguem fora de escopo por decisão explícita anterior). O backend já expõe
`DELETE /users/:id`, e vai passar a exigir a senha atual antes de excluir
(`require-password-for-account-deletion`, no mem-words-backend) — falta a
tela de perfil oferecer essa ação.

## What Changes

- Nova seção "Dados" na tela de perfil, com o botão "Excluir conta".
- Clicar revela um formulário pedindo a senha atual (mesma peça de UI do
  "Trocar senha" já existente: um botão revela um formulário embutido, sem
  modal) e um aviso de que a ação é irreversível e apaga todos os baralhos e
  cards.
- Confirmar com a senha correta exclui a conta, encerra a sessão local por
  completo (mesmo caminho do "Sair", sem tentar voltar à página de onde a
  pessoa saiu) e leva à tela de entrada com um aviso de sucesso.
- Senha incorreta mostra o erro no formulário, sem sair da tela — mesmo
  padrão do "Trocar senha".

## Impact

**Código afetado**

- `src/api/users.js` — nova `deleteUser(id, { currentPassword })`.
- `src/auth/tokenStore.js` — novo motivo de encerramento `ACCOUNT_DELETED`,
  ao lado de `LOGOUT` e `SESSION_EXPIRED`.
- `src/auth/AuthProvider.jsx` — nova `deleteAccount(currentPassword)`; o
  aviso mostrado após o encerramento passa a depender do motivo (hoje só
  distinguia "silencioso" de "sessão expirada").
- `src/pages/ProfilePage.jsx` — nova seção "Dados" com o formulário de
  exclusão.

**Specs afetadas**

- `account/profile-screen`: adiciona o requisito de exclusão da conta pela
  tela de perfil.

Sem mudança de rota, sem novo componente de design system (reaproveita
`Card`, `Button`, `Input`, `Alert` já existentes).
