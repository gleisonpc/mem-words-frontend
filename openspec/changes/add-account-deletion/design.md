## Context

Ver `proposal.md` — Why. Dois pontos fixados de antemão:

- O backend só aceita a exclusão com `currentPassword` no corpo, a partir do
  change `require-password-for-account-deletion` (mem-words-backend, PR
  separado). Esta mudança do frontend depende dele estar mesclado — sem
  isso, o formulário chamaria um endpoint que ainda responde sem exigir
  senha, o que anularia o propósito da exigência.
- O componente `ConfirmDeleteButton` (dois cliques, sem dado extra) já existe
  para baralhos e cards, mas não serve aqui: a exclusão de conta precisa
  coletar a senha atual, não apenas confirmar a intenção.

## Goals / Non-Goals

**Goals**

- Uma única fricção deliberada (a senha atual), não duas.
- Encerrar a sessão local por completo ao excluir, sem deixar o app em um
  estado que ainda mostra dados de uma conta que não existe mais.
- Mensagem de sucesso na tela de entrada, distinguível de "sessão expirou".

**Non-Goals**

- Excluir com um período de carência ("sua conta será apagada em 30 dias") —
  o mockup não pede, e o backend já exclui de forma imediata e definitiva.
- Reautenticação por e-mail ou segundo fator — fora do que este app já
  oferece hoje para qualquer ação sensível (a troca de senha usa o mesmo
  nível: só a senha atual).

## Decisions

### Uma fricção, não duas

`ConfirmDeleteButton` existe porque excluir um baralho ou card não pede
nenhum dado — a única forma de gerar fricção é um segundo clique. Aqui já
há um dado a informar (a senha atual), e ele já é a prova de que a pessoa
quer mesmo continuar — o mesmo raciocínio que já vale para a troca de senha,
que também não tem um duplo clique por cima do campo de senha atual. Empilhar
um "tem certeza?" sobre um formulário que já pede senha seria fricção
redundante, não mais segurança.

Formato: clicar em "Excluir conta" revela um formulário embutido (mesmo
padrão do "Trocar senha" já existente na tela — nenhum modal novo), com um
aviso do que a ação apaga e um campo de senha atual. Confirmar já é a ação
final.

### Novo motivo de encerramento: `ACCOUNT_DELETED`

`tokenStore.clear(reason)` já distingue `LOGOUT` (silencioso) de
`SESSION_EXPIRED` (aviso de alerta). Reaproveitar `LOGOUT` esconderia a
exclusão atrás de um encerramento silencioso — a pessoa não saberia se a
conta foi mesmo excluída ou se caiu por acaso. Reaproveitar
`SESSION_EXPIRED` mostraria "sua sessão expirou", que é enganoso: nada
expirou, a conta deixou de existir.

`ACCOUNT_DELETED` é o terceiro motivo, com aviso de sucesso próprio ("Sua
conta foi excluída."). Como `LOGOUT`, conta como saída pedida pela pessoa
para fins de navegação: `RequireAuth` não tenta guardar `/perfil` como
destino de retorno (ver `signedOut` em `AuthProvider`).

### Sem chamada explícita a `authApi.logout()` antes da exclusão

A ordem é: excluir a conta no backend (que já revoga os refresh tokens via
cascata do schema) e só then encerrar a sessão local. Chamar `logout()`
seria redundante — o cookie de renovação já não corresponde a nenhum token
válido no banco depois da exclusão — mas ainda vale chamá-lo (sem aguardar,
erro engolido, como `signOut` já faz) para limpar o cookie do navegador
também, e só depois do sucesso, não antes: encerrar a sessão antes de confirmar
que a exclusão da conta deu certo deixaria a pessoa deslogada mesmo se a
senha estivesse errada.

## Risks / Trade-offs

- Este change fica sem efeito prático até o backend aceitar a nova forma de
  chamada (`currentPassword` no corpo) — aceitável porque os dois PRs
  (backend e frontend) são revisados e mesclados nesta mesma sessão, nessa
  ordem.

## Migration Plan

Reversível por `git revert` dos dois lados, sem dado de conta a migrar de
volta (a mudança não altera nenhum dado — só adiciona uma via de exclusão
já suportada pelo backend, e antes exposta pelo endpoint sem UI).
