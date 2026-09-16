## MODIFIED Requirements

### Requirement: Entrada por credenciais

A sessão SHALL oferecer a operação de entrada a partir de e-mail e senha.

Entrada bem-sucedida SHALL registrar o usuário retornado pelo backend e
guardar o token de acesso recebido. O token de renovação SHALL NOT ser
manipulado pelo frontend — ele chega e é guardado pelo navegador, via
cookie, sem que o JavaScript da aplicação o veja.

Entrada recusada SHALL NOT alterar o estado da sessão nem guardar token
algum.

#### Scenario: Credenciais corretas
- **WHEN** o backend aceita as credenciais
- **THEN** o usuário fica autenticado
- **AND** o token de acesso recebido fica guardado

#### Scenario: Credenciais incorretas
- **WHEN** o backend recusa as credenciais
- **THEN** a falha é reportada com a mensagem recebida
- **AND** nenhum token é guardado

### Requirement: Persistência da sessão entre recargas

O token de acesso SHALL existir apenas em memória, pelo tempo em que a aba
estiver aberta — ele NÃO SHALL ser gravado em armazenamento persistente. O
token de renovação NUNCA SHALL ser gravado por código do frontend, em
nenhuma forma: ele é um cookie que só o navegador manipula.

Uma dica não sensível de que uma sessão foi iniciada antes — sem token
algum — SHALL persistir no navegador de forma que sobreviva a recarregar a
página e a fechar e reabrir a aba, para que a aplicação saiba que vale a
pena tentar restaurar a sessão em vez de assumir "sem sessão" direto.

O armazenamento dessa dica SHALL ser tolerante a falha: quando o navegador o
recusa ou o bloqueia, a aplicação SHALL continuar funcional, tratando a
sessão como existente apenas enquanto a página estiver aberta.

Nenhum dado além da dica de sessão e da identificação do usuário SHALL ser
guardado.

#### Scenario: Recarregar a página
- **WHEN** a página é recarregada com sessão ativa
- **THEN** o usuário continua autenticado, sem passar pela tela de entrada,
  depois de a sessão ser restaurada pelo cookie

#### Scenario: Armazenamento indisponível
- **WHEN** o navegador recusa ler ou gravar no armazenamento local
- **THEN** a aplicação continua utilizável
- **AND** nenhum erro é apresentado ao usuário por causa disso

#### Scenario: Nenhum token em armazenamento persistente
- **WHEN** o armazenamento do navegador é inspecionado a qualquer momento
- **THEN** nem o token de acesso nem o token de renovação aparecem nele

### Requirement: Restauração validada contra o backend

Ao abrir a aplicação com a dica de uma sessão anterior, a sessão SHALL ser
restaurada obtendo um token de acesso novo pelo cookie do token de renovação
e, em seguida, confirmada consultando os dados do usuário autenticado no
backend — nunca considerada válida só pela dica existir.

Enquanto a restauração não retorna, o estado SHALL permanecer "determinando".

A ausência de um cookie de renovação válido SHALL ser tratada exatamente
como uma sessão inválida, não como um erro à parte.

#### Scenario: Sessão guardada ainda válida
- **WHEN** a aplicação abre com a dica de sessão e o cookie do token de
  renovação ainda é aceito pelo backend
- **THEN** um token de acesso novo é obtido e o usuário retornado passa a
  ser o usuário autenticado

#### Scenario: Sessão guardada já inválida
- **WHEN** a aplicação abre com a dica de sessão, mas o backend recusa a
  renovação
- **THEN** a dica de sessão é descartada
- **AND** o estado passa a ser "sem sessão"

#### Scenario: Backend inacessível na abertura
- **WHEN** a aplicação abre com a dica de sessão e o backend não responde
- **THEN** a sessão não é confirmada
- **AND** a falha é apresentada como problema de conexão, distinguível de
  credenciais inválidas

#### Scenario: Sem dica de sessão
- **WHEN** a aplicação abre sem nenhuma dica de sessão anterior
- **THEN** o estado é "sem sessão" imediatamente, sem tentar renovar ou
  consultar o backend

### Requirement: Renovação automática ao expirar o token de acesso

Quando uma requisição autenticada é recusada por token de acesso ausente,
inválido ou expirado, a sessão SHALL tentar renovar o token de acesso usando
o cookie do token de renovação, e repetir a requisição original uma vez.

A renovação bem-sucedida SHALL substituir o token de acesso guardado pelo
novo. O backend rotaciona o token de renovação a cada uso, mas o frontend
não manipula esse valor — a rotação acontece inteiramente por troca de
cookie.

A requisição repetida SHALL ser transparente para a tela: ela observa apenas
o resultado final.

#### Scenario: Token de acesso expirado
- **WHEN** uma requisição autenticada é recusada por token expirado e a
  renovação é aceita
- **THEN** a requisição original é repetida com o novo token
- **AND** a tela recebe o resultado como se a primeira tentativa tivesse
  funcionado

#### Scenario: Renovação recusada
- **WHEN** a renovação é recusada pelo backend
- **THEN** a sessão é encerrada localmente
- **AND** a requisição original é reportada como falha de autenticação

#### Scenario: Uma única repetição
- **WHEN** a requisição repetida também é recusada por autenticação
- **THEN** nenhuma nova renovação é tentada para aquela requisição
- **AND** a sessão é encerrada localmente

### Requirement: Encerramento de sessão

A sessão SHALL oferecer a operação de sair, que pede ao backend para revogar
o token de renovação — apresentado pelo cookie, sem que o frontend precise
manipulá-lo — e descarta o estado e o token de acesso guardado, junto com a
dica de sessão.

O estado local SHALL ser descartado mesmo que a chamada ao backend falhe:
sair é uma intenção do usuário, e um backend inacessível não pode manter
alguém preso em uma sessão que ele pediu para encerrar.

#### Scenario: Saída com backend disponível
- **WHEN** o usuário sai e o backend confirma a revogação
- **THEN** o estado passa a "sem sessão", o token de acesso é descartado e a
  dica de sessão é removida

#### Scenario: Saída com backend indisponível
- **WHEN** o usuário sai e a chamada ao backend falha
- **THEN** o estado local passa a "sem sessão" e o token de acesso e a dica
  de sessão são descartados de todo modo
