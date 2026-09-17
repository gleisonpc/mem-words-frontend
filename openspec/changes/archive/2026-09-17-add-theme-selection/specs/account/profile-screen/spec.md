## ADDED Requirements

### Requirement: Escolha de tema

A tela de perfil SHALL oferecer a escolha entre três opções de tema: "Do
sistema" (padrão), "Claro" e "Escuro".

A escolha SHALL ser aplicada imediatamente, sem recarregar a página e sem
exigir a ação de salvar.

#### Scenario: Trocar para um tema fixo
- **WHEN** "Claro" ou "Escuro" é escolhido
- **THEN** a interface passa a exibir esse tema imediatamente,
  independente da preferência do sistema operacional

#### Scenario: Voltar para "Do sistema"
- **WHEN** "Do sistema" é escolhido depois de um tema fixo estar ativo
- **THEN** a interface volta a seguir a preferência do sistema operacional

#### Scenario: Opção ativa é indicada
- **WHEN** a tela de perfil é exibida
- **THEN** a opção de tema correspondente à escolha atual é indicada como
  ativa
