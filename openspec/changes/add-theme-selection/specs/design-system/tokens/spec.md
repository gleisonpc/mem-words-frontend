## MODIFIED Requirements

### Requirement: Temas claro e escuro sobre os mesmos nomes

O sistema SHALL oferecer tema claro e tema escuro. Por padrão ("do
sistema"), o tema ativo SHALL seguir a preferência declarada pelo sistema
operacional do usuário.

O sistema SHALL permitir fixar manualmente o tema claro ou o tema escuro,
substituindo a preferência do sistema operacional enquanto essa escolha
estiver ativa. A escolha manual SHALL persistir entre aberturas do
aplicativo, no navegador — não é dado de conta.

Ambos os temas SHALL definir exatamente o mesmo conjunto de nomes de token,
variando apenas os valores. Nenhum token pode existir em um tema e faltar no
outro.

#### Scenario: Preferência do sistema é respeitada
- **WHEN** o usuário tem preferência por tema escuro no sistema operacional
  e não fixou um tema manualmente
- **THEN** a interface é exibida com os valores do tema escuro

#### Scenario: Componente não conhece o tema ativo
- **WHEN** um componente é exibido em qualquer um dos temas, do sistema ou
  fixado manualmente
- **THEN** ele produz a aparência correta sem ramificar por tema
- **AND** nenhuma lógica condicional de tema existe no componente

#### Scenario: Conjuntos de tokens são simétricos
- **WHEN** um token é definido em um dos temas
- **THEN** o mesmo nome está definido no outro tema

#### Scenario: Tema fixado manualmente prevalece sobre o sistema
- **WHEN** o usuário fixa o tema escuro manualmente, mesmo que o sistema
  operacional prefira o tema claro
- **THEN** a interface é exibida com os valores do tema escuro

#### Scenario: Escolha manual persiste entre aberturas
- **WHEN** o aplicativo é reaberto depois de um tema ter sido fixado
  manualmente
- **THEN** o mesmo tema continua ativo, sem exigir escolher de novo
- **AND** nenhum lampejo do tema não escolhido aparece antes da interface
  ser exibida

#### Scenario: Voltar a seguir o sistema
- **WHEN** o usuário escolhe "do sistema" depois de ter fixado um tema
  manualmente
- **THEN** a interface volta a seguir a preferência do sistema operacional
