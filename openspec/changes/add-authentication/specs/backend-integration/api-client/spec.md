## Purpose

Define como o frontend conversa com o backend do mem-words — o endereço usado,
o formato das requisições e respostas, o limite de espera e a tradução de
qualquer falha (do backend, da rede ou do tempo limite) em um resultado único
que as telas sabem exibir.

## ADDED Requirements

### Requirement: URL base única e configurável

Toda requisição ao backend SHALL ser construída a partir da URL base já
resolvida pela configuração da aplicação. Nenhum ponto do frontend SHALL
conter endereço de backend literal.

Trocar o backend de destino SHALL exigir apenas mudar essa configuração, sem
tocar em nenhuma tela ou chamada.

#### Scenario: Chamada usa a URL configurada
- **WHEN** qualquer parte da aplicação chama um endpoint do backend
- **THEN** a requisição parte da URL base configurada para o ambiente
- **AND** o caminho do endpoint é concatenado sem barra duplicada

#### Scenario: Endereço não aparece nas telas
- **WHEN** o código do frontend é inspecionado fora da configuração
- **THEN** nenhum endereço de backend literal é encontrado

### Requirement: Formato de requisição e resposta

O cliente SHALL enviar e aceitar JSON, declarando o tipo de conteúdo quando há
corpo e o tipo aceito em toda requisição.

Respostas sem corpo — como o `204` de encerramento de sessão — SHALL ser
tratadas como sucesso sem dados, e não como falha de leitura.

#### Scenario: Requisição com corpo
- **WHEN** uma operação envia dados ao backend
- **THEN** o corpo é serializado como JSON
- **AND** o tipo de conteúdo é declarado como JSON

#### Scenario: Resposta sem corpo
- **WHEN** o backend responde com sucesso e sem corpo
- **THEN** a operação é considerada bem-sucedida
- **AND** nenhum erro de leitura é reportado

### Requirement: Tempo limite em toda requisição

Toda requisição SHALL ter um limite de espera. Uma requisição que exceda esse
limite SHALL ser abortada e reportada como falha de conexão, com o motivo
explicitando que o tempo limite foi atingido.

Sem isso, uma tela ficaria em carregamento indefinido quando o backend estiver
inacessível — o cenário mais provável, dado que o backend hospedado hiberna
quando fica sem uso.

#### Scenario: Backend não responde
- **WHEN** o backend não responde dentro do limite de espera
- **THEN** a requisição é abortada
- **AND** a falha informa que o tempo limite foi excedido

### Requirement: Tradução do formato de erro do backend

O backend responde a erros com um corpo que traz uma mensagem, um código
estável e, para dados inválidos, uma lista de campos com o motivo de cada
recusa.

O cliente SHALL traduzir essa resposta em uma falha que preserve os três
elementos — mensagem, código e detalhes por campo — de modo que a tela possa
exibir a mensagem geral e marcar cada campo recusado.

Uma resposta de erro sem corpo reconhecível SHALL resultar em falha com
mensagem genérica, nunca em sucesso.

#### Scenario: Dados inválidos
- **WHEN** o backend recusa a requisição por dados inválidos
- **THEN** a falha carrega a mensagem geral, o código do erro e a lista de
  campos recusados com seus motivos

#### Scenario: Erro sem corpo reconhecível
- **WHEN** o backend responde com código de erro e corpo vazio ou ilegível
- **THEN** a falha carrega uma mensagem genérica e o código da resposta
- **AND** a operação não é reportada como sucesso

#### Scenario: Mensagem interna não é exposta
- **WHEN** o backend responde com erro interno
- **THEN** a tela recebe uma mensagem apresentável ao usuário, sem detalhe
  técnico do servidor

### Requirement: Falha de rede é indistinguível de erro de aplicação para a tela

Falha de rede, origem bloqueada por CORS e tempo limite SHALL ser reportadas
com a mesma forma de falha usada para erros do backend, para que nenhuma tela
precise distinguir a origem do problema para exibi-lo.

A falha SHALL, ainda assim, carregar informação suficiente para o diagnóstico —
o motivo original quando disponível.

#### Scenario: Origem bloqueada
- **WHEN** o navegador bloqueia a resposta por política de origem
- **THEN** a falha é reportada como problema de conexão com o backend
- **AND** a tela a exibe pelo mesmo caminho de qualquer outra falha

### Requirement: Envio do token de acesso em rotas autenticadas

O cliente SHALL anexar o token de acesso da sessão ativa, no formato de
portador exigido pelo backend, em toda requisição a endpoint autenticado.

Requisições a endpoints públicos — sinal de saúde, cadastro, entrada,
renovação e encerramento de sessão — SHALL NOT enviar o token de acesso.

O token SHALL NOT aparecer em URL, em parâmetro de consulta ou em registro de
log.

#### Scenario: Endpoint autenticado
- **WHEN** uma requisição alcança endpoint que exige autenticação e há sessão
  ativa
- **THEN** o token de acesso é enviado no cabeçalho de autorização

#### Scenario: Endpoint público
- **WHEN** uma requisição alcança endpoint público
- **THEN** nenhum token é enviado

#### Scenario: Token nunca na URL
- **WHEN** qualquer requisição é montada
- **THEN** o token não aparece na URL nem em parâmetro de consulta
