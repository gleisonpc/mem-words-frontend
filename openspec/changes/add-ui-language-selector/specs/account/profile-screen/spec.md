## ADDED Requirements

### Requirement: Escolha de idioma da interface

A tela de perfil SHALL oferecer a escolha entre dois idiomas de
interface: "Português" e "English".

A escolha SHALL ser aplicada imediatamente, sem recarregar a página e sem
exigir a ação de salvar.

#### Scenario: Trocar de idioma
- **WHEN** "English" é escolhido
- **THEN** a interface passa a exibir-se em inglês imediatamente

#### Scenario: Opção ativa é indicada
- **WHEN** a tela de perfil é exibida
- **THEN** a opção de idioma correspondente à escolha atual é indicada
  como ativa
