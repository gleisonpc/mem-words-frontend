## ADDED Requirements

### Requirement: Edição de perfil

A sessão SHALL oferecer a operação de atualizar o nome, o e-mail e/ou a
senha do usuário autenticado.

Edição bem-sucedida SHALL atualizar imediatamente o usuário exposto pela
fonte única de verdade da sessão, sem exigir recarregar a página nem
consultar o backend de novo.

Edição recusada SHALL NOT alterar o usuário exposto pela sessão.

#### Scenario: Nome ou e-mail atualizados
- **WHEN** a edição de nome e/ou e-mail é aceita pelo backend
- **THEN** o usuário exposto pela sessão passa a refletir os novos valores

#### Scenario: Senha trocada
- **WHEN** a troca de senha é aceita pelo backend
- **THEN** a operação é reportada como bem-sucedida a quem chamou
- **AND** a sessão atual continua ativa até o token de acesso em memória
  expirar naturalmente — a sessão SHALL NOT ser encerrada como efeito
  direto de trocar a própria senha

#### Scenario: Edição recusada
- **WHEN** o backend recusa a edição
- **THEN** a falha é reportada com a mensagem recebida
- **AND** o usuário exposto pela sessão permanece o de antes da tentativa
