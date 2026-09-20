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

### Requirement: Sugestão de dicionário ao criar um card

A tela de criação de card SHALL oferecer uma ação explícita ("Buscar
sugestão") para obter, a partir da palavra digitada, uma sugestão de
tradução, frase de exemplo e sinônimos. A busca SHALL ocorrer somente
quando essa ação é acionada — nunca automaticamente enquanto a palavra é
digitada — para que a pessoa saiba exatamente quando uma busca está
acontecendo. A ação SHALL ficar indisponível enquanto a palavra estiver
vazia.

> **Correção pós-lançamento:** a primeira versão buscava automaticamente
> ao sair do campo Palavra (`onBlur`), sem nenhum indício visual de que
> uma busca estava em curso nem de que ela não encontrou nada — quem
> usava não sabia se o recurso funcionava. Trocado por uma ação explícita
> com estado de carregamento visível e uma mensagem quando a busca não
> encontra nada, em vez de silêncio total.

Enquanto a busca está em curso, a tela SHALL indicar que a operação está
em andamento. Concluída sem nenhuma sugestão encontrada — par de idiomas
não reconhecido, serviço indisponível, ou resposta sem conteúdo
aproveitável —, a tela SHALL informar que nada foi encontrado para aquela
palavra, sem tratar isso como erro.

A sugestão obtida SHALL ser exibida separada dos campos do formulário, com
uma ação para aplicá-la e outra para descartá-la, e NÃO SHALL preencher
nenhum campo sem essa confirmação explícita.

> **Correção pós-lançamento:** a sugestão sempre pôde trazer, além de
> tradução, frase de exemplo e sinônimos, a tradução da frase de exemplo
> e a classe gramatical da palavra — mas a tela só exibia e aplicava os
> três primeiros campos, deixando "Tradução da frase" e "Classe
> gramatical" sempre em branco mesmo quando o backend os devolvia.
> Corrigido para exibir e aplicar também esses dois campos, do mesmo jeito
> que os demais.

Aplicada, a sugestão SHALL permanecer editável como qualquer valor digitado
manualmente.

Trocar a palavra ou o baralho escolhido depois de uma busca SHALL descartar
a sugestão, ou a mensagem de "nada encontrado", já exibida — nenhuma das
duas continua correspondendo ao que está nos campos.

#### Scenario: Buscar e encontrar sugestão
- **WHEN** a ação de buscar sugestão é acionada com uma palavra preenchida
  e o par de idiomas do baralho escolhido é reconhecido, e ao menos um
  serviço externo devolve conteúdo
- **THEN** a tela exibe a sugestão de tradução, frase de exemplo e/ou
  sinônimos encontrados, com as ações de usar ou descartar

#### Scenario: Busca em andamento
- **WHEN** a ação de buscar sugestão é acionada
- **THEN** a tela indica que a busca está em andamento até a resposta
  chegar

#### Scenario: Buscar sem encontrar nada
- **WHEN** a busca é concluída sem nenhuma sugestão — par de idiomas não
  reconhecido, serviço externo indisponível, ou nenhum conteúdo
  aproveitável
- **THEN** a tela informa que não encontrou sugestão para aquela palavra,
  sem mensagem de erro

#### Scenario: Ação indisponível sem palavra
- **WHEN** o campo Palavra está vazio
- **THEN** a ação de buscar sugestão fica indisponível

#### Scenario: Aplicar a sugestão
- **WHEN** a ação de usar a sugestão é acionada
- **THEN** os campos correspondentes passam a exibir os valores sugeridos,
  editáveis a partir daí

#### Scenario: Descartar a sugestão
- **WHEN** a ação de descartar é acionada
- **THEN** a sugestão deixa de ser exibida e nenhum campo é alterado

#### Scenario: Trocar a palavra ou o baralho descarta o resultado anterior
- **WHEN** a palavra é editada, ou um baralho diferente é escolhido, depois
  de uma busca já concluída
- **THEN** a sugestão ou a mensagem de "nada encontrado" exibida some, até
  uma nova busca ser acionada
