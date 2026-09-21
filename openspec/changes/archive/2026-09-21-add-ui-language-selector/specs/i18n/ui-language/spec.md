## Purpose

Define os dicionários de texto de interface do mem-words (português do
Brasil e inglês), qual idioma está ativo, e a garantia de que todo texto
de interface — não o conteúdo criado pelo usuário — vem do idioma ativo.

## ADDED Requirements

### Requirement: Dois idiomas de interface, com o mesmo conjunto de textos

O sistema SHALL oferecer dois idiomas de interface: português do Brasil
(padrão) e inglês.

Os dois idiomas SHALL definir exatamente o mesmo conjunto de textos —
nenhum texto pode existir em um idioma e faltar no outro.

#### Scenario: Conjuntos de texto são simétricos
- **WHEN** um texto de interface é definido em um dos idiomas
- **THEN** o mesmo texto está definido no outro idioma

#### Scenario: Português é o padrão
- **WHEN** nenhuma escolha de idioma foi feita
- **THEN** a interface é exibida em português do Brasil

### Requirement: Texto de interface segue o idioma ativo

Todo texto de interface da aplicação — rótulos, botões, mensagens de erro
e sucesso, títulos de tela, textos de estado vazio ou de carregamento —
SHALL vir do idioma ativo.

Conteúdo criado pelo próprio usuário — nome de baralho, palavra,
tradução, frase de exemplo, anotação pessoal, e o texto livre que o
usuário digita como idioma de um baralho — NÃO SHALL ser afetado pela
troca de idioma da interface.

#### Scenario: Troca para inglês
- **WHEN** o inglês é escolhido como idioma da interface
- **THEN** toda tela passa a exibir seus textos de interface em inglês

#### Scenario: Conteúdo do usuário não muda
- **WHEN** o idioma da interface é trocado
- **THEN** nome de baralho, palavras, traduções e demais dados digitados
  pelo usuário continuam exatamente como foram digitados

### Requirement: Escolha persistida e aplicada sem recarregar

A escolha de idioma SHALL persistir entre aberturas do aplicativo, no
navegador — não é campo de conta no backend.

A escolha SHALL ser aplicada imediatamente a toda a interface, sem
recarregar a página.

#### Scenario: Escolha persiste
- **WHEN** o aplicativo é reaberto depois do idioma ter sido trocado
- **THEN** o mesmo idioma continua ativo, sem exigir escolher de novo

#### Scenario: Aplicação imediata
- **WHEN** um idioma diferente do ativo é escolhido
- **THEN** toda tela exibida passa a mostrar esse idioma imediatamente,
  sem recarregar a página

### Requirement: Atributo de idioma do documento acompanha a escolha

O elemento raiz do documento SHALL ter seu atributo de idioma (`lang`)
atualizado para corresponder ao idioma ativo, para leitores de tela e
outras ferramentas de acessibilidade.

#### Scenario: Atributo reflete o idioma ativo
- **WHEN** um idioma é ativado, seja no carregamento inicial ou por troca
  manual
- **THEN** o atributo `lang` do documento corresponde a esse idioma

### Requirement: Formatação de data segue o idioma ativo

Datas exibidas na interface SHALL ser formatadas de acordo com as
convenções do idioma ativo — nomes de mês e demais elementos textuais da
data.

#### Scenario: Data em inglês
- **WHEN** o idioma ativo é inglês
- **THEN** datas exibidas na interface usam nomes de mês e formato em
  inglês
