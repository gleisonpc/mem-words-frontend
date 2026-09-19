## MODIFIED Requirements

### Requirement: Criação de card em um baralho

A criação de um card SHALL ter tela própria, endereçável por URL, com os
campos obrigatórios de palavra e tradução, os campos opcionais de classe
gramatical, sinônimos, frase de exemplo, tradução da frase e anotação
pessoal, e um campo para escolher em qual baralho do usuário o card é
criado, pré-selecionado com o baralho de origem.

A tela de detalhe de um baralho SHALL oferecer uma ação que leva a essa
tela, em vez de exibir o formulário de criação embutido nela.

Criado o card, o usuário SHALL ser levado de volta à tela de detalhe do
baralho escolhido.

#### Scenario: Criação com campos obrigatórios
- **WHEN** palavra e tradução são informadas e aceitas
- **THEN** o card é criado no baralho escolhido
- **AND** o usuário é levado à tela de detalhe daquele baralho, com o card
  já na lista

#### Scenario: Palavra ou tradução vazia
- **WHEN** a criação é acionada sem palavra ou sem tradução
- **THEN** o campo correspondente é marcado como inválido e nenhuma
  requisição é enviada

#### Scenario: Acesso a partir da tela de detalhe
- **WHEN** a ação de criar card é acionada na tela de detalhe de um baralho
- **THEN** o usuário é levado à tela de criação de card, com aquele baralho
  pré-selecionado

#### Scenario: Trocar o baralho de destino
- **WHEN** um baralho diferente é escolhido no campo de baralho da tela de
  criação de card
- **THEN** o card, se criado, é criado nesse baralho, e não no baralho de
  origem

#### Scenario: Criar e continuar criando
- **WHEN** a ação de salvar e criar outra é acionada com dados aceitos
- **THEN** o card é criado e a tela volta a um formulário vazio, pronta
  para o próximo, em vez de navegar para a tela de detalhe

## ADDED Requirements

### Requirement: Sugestão automática de dicionário ao criar um card

Enquanto a palavra é preenchida, a tela de criação de card SHALL tentar
obter, de serviços públicos de dicionário e tradução, uma sugestão de
tradução, frase de exemplo e sinônimos, desde que o par de idiomas do
baralho escolhido seja um par reconhecido pela tela.

A sugestão SHALL ser exibida separada dos campos do formulário, com uma
ação para aplicá-la e outra para descartá-la, e NÃO SHALL preencher
nenhum campo sem essa confirmação explícita.

Aplicada, a sugestão SHALL permanecer editável como qualquer valor digitado
manualmente.

Indisponibilidade de qualquer serviço externo, resposta sem conteúdo
aproveitável, ou par de idiomas não reconhecido SHALL ser tratada como
"sem sugestão": a tela permanece utilizável exatamente como sem a
sugestão, sem mensagem de erro.

#### Scenario: Sugestão disponível
- **WHEN** a palavra é preenchida com o par de idiomas do baralho
  reconhecido, e o serviço externo devolve conteúdo
- **THEN** a tela exibe a sugestão de tradução, frase de exemplo e/ou
  sinônimos encontrados, com as ações de usar ou descartar

#### Scenario: Aplicar a sugestão
- **WHEN** a ação de usar a sugestão é acionada
- **THEN** os campos correspondentes passam a exibir os valores sugeridos,
  editáveis a partir daí

#### Scenario: Descartar a sugestão
- **WHEN** a ação de descartar é acionada
- **THEN** a sugestão deixa de ser exibida e nenhum campo é alterado

#### Scenario: Par de idiomas não reconhecido
- **WHEN** o baralho escolhido tem um par de idiomas que a tela não
  reconhece
- **THEN** a tela funciona como um formulário manual, sem exibir nem
  tentar obter sugestão

#### Scenario: Serviço externo indisponível
- **WHEN** a busca de sugestão falha ou não responde a tempo
- **THEN** a tela permanece utilizável, sem exibir a sugestão e sem
  mensagem de erro
