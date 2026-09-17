## Context

Ver `proposal.md` para motivação. O backend já expõe, sem mudança nesta
proposta:

- `PATCH /users/:id`: aceita `name`, `email`, `password` +
  `currentPassword` (exigido só quando `password` é enviado), todos
  opcionais entre si (ao menos um obrigatório). Só funciona sobre a
  própria conta (`403` para outro `id`, já garantido pelo middleware
  `ensureSelf`, reaproveitado das rotas de usuário existentes).
- Trocar a senha revoga **todos** os tokens de renovação do usuário,
  incluindo o da aba atual — não há exceção para "a sessão que pediu a
  troca". O token de acesso em memória continua válido até expirar
  (15 min por padrão); só a próxima renovação vai falhar.

O frontend já tem, e este change reaproveita sem mudar: `src/api/client.js`
(`request`), `ApiError`, `useAuthForm`, as funções de validação de
`src/auth/validation.js` (`validateName`, `validateEmail`,
`validateNewPassword`, `validateCurrentPassword` — já espelham
exatamente as regras do backend, porque foram escritas para as telas de
autenticação a partir das mesmas regras), e os componentes base
(`Card`, `Button`, `Input`, `Alert`).

`AuthProvider` é a única fonte de verdade sobre a sessão; hoje expõe
`signIn`, `signUp`, `signOut`. Nenhuma tela lê ou grava o usuário por
fora dele.

## Goals / Non-Goals

**Goals:**
- Editar nome e e-mail, e trocar a senha, a partir de uma tela própria.
- O nome/e-mail exibidos em qualquer lugar da aplicação (o cabeçalho da
  área autenticada, por exemplo) refletirem a edição sem recarregar.

**Non-Goals:**
- Tema, exportar `.csv`, importar `.apkg`, excluir conta — ver
  `proposal.md`.
- Forçar saída imediata depois de trocar a senha — ver decisão abaixo.
- Confirmar a nova senha duas vezes (campo duplicado) — nenhuma tela do
  app faz isso hoje (nem o cadastro), e não é este change que introduz o
  padrão.

## Decisions

### `updateProfile` entra em `AuthProvider`, ao lado de `signIn`/`signUp`

A tela de perfil não chama `usersApi.updateUser` diretamente: ela chama
`updateProfile(input)`, exposto pelo contexto de sessão. A função chama o
backend com o `id` do usuário autenticado (lido do próprio estado da
sessão, não passado pela tela), e, tendo sucesso, atualiza o usuário no
estado e no depósito (`tokenStore.setUser`) — o mesmo par que `signIn`
já faz. Sem isso, o cabeçalho da área autenticada (que lê `user` do
mesmo contexto) ficaria mostrando o nome antigo até uma recarga.

Alternativa descartada: a tela chamar `usersApi.updateUser` direto e
devolver o resultado para quem a usa atualizar o que quiser. Funcionaria
para a própria tela, mas deixaria o cabeçalho (e qualquer outro consumidor
futuro de `useAuth().user`) sem saber que o nome mudou — o mesmo problema
que a regra existente "nenhuma tela lê/grava sessão por fora do contexto"
já existe para evitar.

### Trocar a senha não desloga a sessão atual imediatamente

Como o token de acesso em memória continua válido até expirar, e o fluxo
de "sessão expirada" (`tokenStore.onSessionEnded`) já existe e já mostra
"Sua sessão expirou. Entre novamente." quando a renovação falha, a tela
não precisa fazer nada especial: a sessão atual simplesmente para de
funcionar, sozinha, na próxima renovação — o mecanismo já existente cobre
o caso sem mudança. A tela só mostra que a senha foi trocada com sucesso,
ali mesmo.

Alternativa descartada: chamar `signOut()` logo após trocar a senha,
forçando saída imediata. Mais "correto" em teoria (a sessão realmente não
tem mais um token de renovação válido), mas a mensagem de saída forçada
("sessão expirada") logo depois de uma ação que a própria pessoa acabou
de confirmar com a senha atual seria confuso — pareceria um erro, não uma
consequência esperada. Deixar a sessão atual viva pelos minutos que
faltam ao token de acesso é a mesma janela de tolerância que já existe
hoje para qualquer expiração natural.

### Trocar senha é um formulário à parte, revelado sob demanda

Nome/e-mail e senha são duas operações com resultados diferentes (uma
atualiza dados de exibição; a outra derruba sessões em outros
dispositivos) e o backend já as trata como confirmações separadas
(`currentPassword` só entra em jogo para a senha). Um botão "Trocar
senha" revela um formulário próprio (senha atual, nova senha, Salvar,
Cancelar) — mesma técnica de alternância já usada em `DeckDetailPage`
(`DeckEditForm`) — em vez de um único formulário com todos os campos
sempre visíveis.

### Reenvio de nome/e-mail inalterados é inofensivo

O formulário de conta sempre envia `name` e `email` com os valores atuais
do campo, mesmo que a pessoa só tenha mudado um dos dois. O backend já
trata isso sem efeito colateral: a checagem de e-mail duplicado só roda
quando o e-mail enviado é diferente do atual. Simplifica o formulário (um
`onSaved`/`handleSubmit` só, sem rastrear qual campo mudou) sem custo.

## Risks / Trade-offs

- [Sessão atual continua "funcionando" por até 15 minutos depois da troca
  de senha, mesmo que o token de renovação já esteja revogado] → aceito;
  ver decisão acima. É a mesma janela de confiança que o token de acesso
  já tem para qualquer outra operação.
- [Formulário de conta reenvia nome/e-mail mesmo sem mudança] → aceito;
  ver decisão acima, sem custo observável.

## Migration Plan

Só tela e chamadas novas; nenhuma mudança de contrato com o backend,
nenhuma migração de dados. Reversão: `git revert` do commit, ou remover a
rota e o link do cabeçalho.
