## ADDED Requirements

### Requirement: Entrada com Google

A sessão SHALL oferecer a operação de entrar apresentando um ID token do
Google, obtido no navegador pelo Google Identity Services, como
alternativa à entrada por credenciais.

Entrada com Google bem-sucedida SHALL registrar o usuário retornado pelo
backend e guardar o token de acesso recebido, exatamente como a entrada
por credenciais faz — mesmo estado de sessão, mesma dica persistida, sem
exigir nenhum dado adicional de quem está entrando.

O frontend SHALL NOT precisar distinguir se a entrada com Google criou uma
conta nova ou autenticou uma já existente — essa decisão é do backend, e o
resultado observável pela sessão é o mesmo nos dois casos.

Entrada com Google recusada SHALL NOT alterar o estado da sessão nem
guardar token algum.

#### Scenario: Entrada com Google bem-sucedida

- **WHEN** o Google devolve um ID token e o backend o aceita
- **THEN** o usuário fica autenticado
- **AND** o token de acesso recebido fica guardado, como na entrada por
  credenciais

#### Scenario: Backend recusa o ID token

- **WHEN** o backend recusa o ID token apresentado
- **THEN** a falha é reportada a quem chamou
- **AND** a sessão permanece inexistente

#### Scenario: Google não retorna um token

- **WHEN** a pessoa cancela o fluxo do Google, ou o Google não consegue
  concluí-lo (script bloqueado, popup fechado, origem não autorizada)
- **THEN** nenhuma chamada ao backend é feita
- **AND** a sessão permanece exatamente como estava antes da tentativa
