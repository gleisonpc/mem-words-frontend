## ADDED Requirements

### Requirement: Botão de entrada com Google

As telas de entrada e de cadastro SHALL oferecer um botão "Entrar com o
Google", visualmente separado do formulário de e-mail e senha por um
divisor, construído com os componentes e tokens do design system como o
resto da tela.

Acionar o botão e concluir o fluxo do Google com sucesso SHALL levar a
pessoa à área autenticada, do mesmo jeito que a entrada ou o cadastro por
credenciais já levam.

Quando a variável de configuração do Google não estiver definida, a tela
SHALL continuar funcional só com o formulário de e-mail e senha, sem
exibir o botão nem qualquer erro por causa da ausência dele.

#### Scenario: Entrada com Google bem-sucedida

- **WHEN** a pessoa aciona "Entrar com o Google" e conclui o fluxo do
  Google
- **THEN** ela é levada à área autenticada

#### Scenario: Configuração do Google ausente

- **WHEN** a aplicação não tem a configuração do Google definida
- **THEN** a tela exibe normalmente o formulário de e-mail e senha, sem o
  botão do Google e sem mensagem de erro

### Requirement: Falhas do fluxo do Google comunicadas sem se confundir com credenciais

Uma falha do próprio fluxo do Google (cancelamento pela pessoa, popup
bloqueado, script não carregado, origem não autorizada) SHALL ser
comunicada como mensagem geral da tela, distinta da mensagem de
credenciais inválidas do formulário de e-mail e senha.

Uma falha do fluxo do Google SHALL NOT marcar os campos do formulário de
e-mail e senha como inválidos, nem impedir uma tentativa em seguida por
e-mail e senha ou um novo acionamento do botão do Google.

Uma recusa do backend ao ID token apresentado SHALL ser exibida como
mensagem geral do formulário, da mesma forma que outros erros sem campo
específico já são exibidos.

#### Scenario: Pessoa cancela o fluxo do Google

- **WHEN** a pessoa fecha a janela ou cancela o fluxo do Google antes de
  concluí-lo
- **THEN** nenhuma mensagem de erro é exibida
- **AND** a tela permanece exatamente como estava, pronta para nova
  tentativa

#### Scenario: Google indisponível

- **WHEN** o script do Google não carrega ou a origem não está autorizada
- **THEN** a tela informa uma falha ao entrar com o Google
- **AND** o formulário de e-mail e senha continua disponível normalmente

#### Scenario: Backend recusa o ID token

- **WHEN** o backend recusa o ID token apresentado
- **THEN** a mensagem aparece como erro geral do formulário
- **AND** nenhum campo do formulário de e-mail e senha é marcado como
  inválido
