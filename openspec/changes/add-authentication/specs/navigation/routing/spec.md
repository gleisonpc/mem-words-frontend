## Purpose

Define o mapa de telas do mem-words e a fronteira entre o que é público e o
que exige sessão — como a guarda de rota se comporta, o que acontece com quem
chega sem sessão a um destino protegido e como cada tela passa a ser
endereçável por uma URL própria.

## ADDED Requirements

### Requirement: Telas endereçáveis por URL

Cada tela da aplicação SHALL ter uma URL própria, de modo que um endereço
possa ser copiado, compartilhado ou salvo nos favoritos e leve à mesma tela.

A navegação entre telas SHALL ocorrer sem recarregar a aplicação, e os botões
de voltar e avançar do navegador SHALL funcionar como o usuário espera.

#### Scenario: Endereço direto
- **WHEN** uma URL de tela é aberta diretamente no navegador
- **THEN** a tela correspondente é exibida

#### Scenario: Voltar do navegador
- **WHEN** o usuário navega entre telas e usa o botão voltar
- **THEN** a tela anterior é exibida sem recarregar a aplicação

#### Scenario: Endereço desconhecido
- **WHEN** uma URL que não corresponde a nenhuma tela é aberta
- **THEN** a aplicação informa que a página não existe e oferece caminho de
  volta, em vez de exibir tela em branco

### Requirement: Rotas públicas e rotas protegidas

A aplicação SHALL distinguir rotas públicas, alcançáveis sem sessão, de rotas
protegidas, que exigem sessão ativa.

As telas de entrada e de cadastro SHALL ser públicas.

A tela de diagnóstico do backend SHALL ser pública: ela é a ferramenta para
descobrir que o backend está inacessível, o que inclui o caso em que a própria
entrada não funciona por isso.

#### Scenario: Rota pública sem sessão
- **WHEN** alguém sem sessão abre uma rota pública
- **THEN** a tela é exibida normalmente

#### Scenario: Diagnóstico sem sessão
- **WHEN** alguém sem sessão abre o diagnóstico do backend
- **THEN** a verificação de saúde é exibida, sem exigir autenticação

### Requirement: Guarda de rota

Uma rota protegida SHALL ser exibida somente quando há sessão ativa.

Quem chega a uma rota protegida sem sessão SHALL ser levado à tela de entrada,
sem que qualquer conteúdo da tela protegida seja exibido antes.

#### Scenario: Acesso sem sessão
- **WHEN** alguém sem sessão abre uma rota protegida
- **THEN** é levado à tela de entrada
- **AND** nenhum conteúdo da rota protegida chega a ser exibido

#### Scenario: Acesso com sessão
- **WHEN** alguém com sessão ativa abre uma rota protegida
- **THEN** a tela é exibida

### Requirement: Espera pela determinação da sessão

Enquanto a aplicação ainda determina se há sessão válida, a guarda SHALL NOT
concluir que o usuário é anônimo: ela SHALL exibir estado de carregamento.

Sem essa espera, recarregar uma rota protegida com sessão válida jogaria o
usuário na tela de entrada por um instante, antes de devolvê-lo à tela — um
salto visível e uma falsa indicação de que a sessão caiu.

#### Scenario: Recarga em rota protegida
- **WHEN** uma rota protegida é recarregada com sessão guardada válida
- **THEN** um estado de carregamento é exibido enquanto a sessão é confirmada
- **AND** a tela de entrada não é exibida em nenhum momento

### Requirement: Retorno ao destino pretendido

Quando a guarda desvia alguém para a entrada, o destino pretendido SHALL ser
lembrado e, concluída a autenticação, o usuário SHALL ser levado a ele.

Sem destino lembrado, a autenticação SHALL levar à tela inicial da área
autenticada.

#### Scenario: Retorno após entrar
- **WHEN** alguém sem sessão tenta abrir uma rota protegida e em seguida
  autentica
- **THEN** é levado à rota que tentou abrir, não à tela inicial

#### Scenario: Entrada direta
- **WHEN** alguém abre a tela de entrada por vontade própria e autentica
- **THEN** é levado à tela inicial da área autenticada

### Requirement: Rotas públicas de autenticação são inacessíveis com sessão ativa

Quem já tem sessão ativa SHALL NOT permanecer nas telas de entrada ou de
cadastro: abrir uma delas SHALL levar à tela inicial da área autenticada.

Isso evita o estado ambíguo de um formulário de login exibido a quem já está
autenticado.

#### Scenario: Entrada com sessão ativa
- **WHEN** alguém com sessão ativa abre a tela de entrada
- **THEN** é levado à tela inicial da área autenticada

### Requirement: Identidade e saída visíveis na área autenticada

Na área autenticada, a aplicação SHALL exibir quem está autenticado e SHALL
oferecer a ação de sair em lugar alcançável de qualquer tela protegida.

Concluída a saída, o usuário SHALL ser levado a uma rota pública.

#### Scenario: Identidade exibida
- **WHEN** uma tela protegida é exibida
- **THEN** o nome ou o e-mail de quem está autenticado é visível
- **AND** a ação de sair está alcançável

#### Scenario: Saída
- **WHEN** o usuário aciona a saída
- **THEN** a sessão é encerrada e ele é levado a uma rota pública

### Requirement: Galeria de componentes migrada para rota própria

A galeria de componentes SHALL ser alcançável por uma rota própria, mantendo o
requisito de ser alcançável na aplicação em execução.

O mecanismo anterior — um parâmetro de consulta interpretado pela tela inicial
— SHALL ser removido, já que a aplicação passa a ter rotas de verdade.

#### Scenario: Galeria por rota
- **WHEN** a rota da galeria é aberta
- **THEN** a galeria é exibida

#### Scenario: Mecanismo anterior removido
- **WHEN** o parâmetro de consulta antigo é usado na tela inicial
- **THEN** ele não tem efeito algum sobre qual tela é exibida
