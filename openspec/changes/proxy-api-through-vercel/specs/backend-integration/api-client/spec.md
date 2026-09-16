## MODIFIED Requirements

### Requirement: URL base única e configurável

Toda requisição ao backend SHALL ser construída a partir da URL base já
resolvida pela configuração da aplicação. Nenhum ponto do frontend SHALL
conter endereço de backend literal.

Trocar o backend de destino SHALL exigir apenas mudar essa configuração, sem
tocar em nenhuma tela ou chamada.

Em produção, a URL base MUST resolver para um caminho da própria origem do
frontend, não para uma URL de outro domínio — o cookie do token de renovação
depende de a requisição nunca sair, do ponto de vista do navegador, da
origem que serviu a página. Uma URL de outro domínio faria o navegador tratar
esse cookie como de terceiros, sujeito a bloqueio independente de qualquer
atributo do próprio cookie.

#### Scenario: Chamada usa a URL configurada
- **WHEN** qualquer parte da aplicação chama um endpoint do backend
- **THEN** a requisição parte da URL base configurada para o ambiente
- **AND** o caminho do endpoint é concatenado sem barra duplicada

#### Scenario: Endereço não aparece nas telas
- **WHEN** o código do frontend é inspecionado fora da configuração
- **THEN** nenhum endereço de backend literal é encontrado

#### Scenario: URL base em produção é da própria origem
- **WHEN** a aplicação publicada faz uma requisição ao backend
- **THEN** o navegador enxerga a requisição como dirigida à mesma origem que
  serviu a página, não a um domínio diferente
