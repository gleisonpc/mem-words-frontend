## Why

Não há tela nenhuma para editar a própria conta — o backend já suporta
tudo isso (`PATCH /users/:id` aceita nome, e-mail e troca de senha com
confirmação da senha atual), mas o frontend não oferece caminho até ele.
Quem quer corrigir o nome, atualizar o e-mail ou trocar a senha não tem
como, exceto recriando a conta.

## What Changes

- Nova tela de perfil, em rota própria (`/perfil`): edita nome e e-mail
  num formulário, e oferece a troca de senha (senha atual + nova senha)
  num formulário à parte, revelado sob demanda.
- Um link "Perfil" na área autenticada, alcançável de qualquer tela
  protegida (mesmo lugar de onde já se alcança "Sair").
- A sessão (fonte única de verdade sobre quem está autenticado) ganha a
  operação de atualizar o próprio perfil, refletindo o novo nome/e-mail
  imediatamente onde quer que a sessão seja consultada — sem exigir
  recarregar a página.
- Novo módulo `src/api/users.js` ganha `updateUser(id, input)`,
  reaproveitando o cliente HTTP único existente. Nenhuma dependência
  nova, nenhuma mudança no backend.

## Capabilities

### New Capabilities

- `account/profile-screen`: a tela de perfil — campos, validação no
  cliente espelhando o backend, o formulário de troca de senha revelado
  sob demanda, e o que a tela garante a quem navega por teclado ou usa
  leitor de tela.

### Modified Capabilities

- `auth/session`: ganha a operação de editar o próprio perfil (nome,
  e-mail, senha), que atualiza a fonte única de verdade sobre a sessão.

## Impact

- `src/pages/ProfilePage.jsx` (+ CSS): nova tela.
- `src/auth/AuthProvider.jsx`: nova operação `updateProfile`, análoga a
  `signIn`/`signUp` — chama o backend e atualiza o estado da sessão.
- `src/api/users.js`: novo `updateUser(id, input)`.
- `src/components/AuthenticatedLayout.jsx`: novo link para `/perfil`.
- `src/routes.jsx`: nova rota protegida `/perfil`.
- Fora de escopo nesta mudança (mockup completo do Perfil junta mais do
  que isto): escolha de tema claro/escuro/sistema, exportar cards em
  `.csv`, importar baralho do Anki (`.apkg`), excluir a própria conta —
  cada uma fica para uma mudança própria.
