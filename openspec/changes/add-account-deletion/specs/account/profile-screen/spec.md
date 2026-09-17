## MODIFIED Requirements

### Requirement: Validação no cliente espelhando as regras do backend

Antes de enviar, os formulários de conta, de troca de senha e de exclusão
da conta SHALL validar os campos com as mesmas regras que o backend aplica
— presença, formato de e-mail, e os limites de tamanho de nome e de senha.

A validação no cliente SHALL servir para dar resposta imediata, e NÃO SHALL
ser tratada como a garantia: a recusa do backend continua sendo a palavra
final e SHALL ser exibida quando ocorrer.

Recusa na validação local SHALL NOT gerar requisição ao backend.

#### Scenario: Nome vazio
- **WHEN** a edição de conta é acionada com o nome vazio
- **THEN** o campo é marcado como inválido e nenhuma requisição é enviada

#### Scenario: E-mail em formato inválido
- **WHEN** a edição de conta é acionada com um e-mail em formato inválido
- **THEN** o campo é marcado como inválido e nenhuma requisição é enviada

#### Scenario: Nova senha curta demais
- **WHEN** a troca de senha é acionada com a nova senha menor que o
  mínimo aceito
- **THEN** o campo é marcado como inválido e nenhuma requisição é enviada

#### Scenario: Backend recusa o que passou localmente
- **WHEN** os dados passam pela validação local e o backend os recusa
- **THEN** a recusa do backend é exibida na tela, atribuída ao campo
  correspondente quando o backend indicar qual campo falhou

#### Scenario: Senha atual vazia na exclusão
- **WHEN** a exclusão da conta é acionada com o campo de senha atual vazio
- **THEN** o campo é marcado como inválido e nenhuma requisição é enviada

### Requirement: Estado de envio em curso

Durante o envio de qualquer um dos formulários da tela, a tela SHALL
indicar que a operação está em curso e SHALL impedir novo envio do mesmo
formulário até que o resultado chegue.

#### Scenario: Envio em curso
- **WHEN** um dos formulários está sendo enviado
- **THEN** a ação exibe estado de carregamento
- **AND** acioná-la de novo não dispara outra requisição

#### Scenario: Erro libera o formulário
- **WHEN** o envio termina em falha
- **THEN** a ação volta a estar disponível para nova tentativa

### Requirement: Formulários acessíveis por teclado e a leitores de tela

Cada campo dos formulários da tela SHALL ter rótulo programaticamente
associado ao seu controle, e cada mensagem de erro de campo SHALL estar
associada ao campo correspondente.

Os formulários SHALL poder ser enviados pelo teclado, sem exigir clique no
botão.

#### Scenario: Envio pelo teclado
- **WHEN** o usuário pressiona Enter com o foco em um campo de um desses
  formulários
- **THEN** o formulário é enviado

#### Scenario: Erro alcançável por leitor de tela
- **WHEN** um campo é marcado como inválido
- **THEN** a mensagem de erro está associada ao campo, e não apenas
  próxima dele na tela

## ADDED Requirements

### Requirement: Exclusão da conta

A tela de perfil SHALL oferecer a exclusão definitiva da própria conta, como
uma ação distinta das demais, revelando um formulário próprio com o campo de
senha atual somente quando acionada.

O formulário SHALL avisar que a ação é irreversível e apaga todos os
baralhos e cards da conta.

A senha atual SHALL ser exigida para confirmar a exclusão.

Uma exclusão bem-sucedida SHALL encerrar a sessão local por completo e SHALL
levar o usuário à tela de entrada com um aviso de sucesso, distinto do aviso
de sessão expirada.

#### Scenario: Exclusão bem-sucedida

- **WHEN** a senha atual confere e a exclusão é aceita pelo backend
- **THEN** a sessão é encerrada e a tela de entrada é exibida com um aviso
  de que a conta foi excluída

#### Scenario: Senha atual incorreta

- **WHEN** a senha atual informada não confere
- **THEN** a recusa do backend é exibida como erro geral do formulário de
  exclusão, a conta permanece e a sessão atual continua ativa

#### Scenario: Cancelar a exclusão

- **WHEN** a exclusão é cancelada antes de confirmar
- **THEN** o formulário de exclusão volta a ficar oculto, sem nenhuma
  requisição enviada
