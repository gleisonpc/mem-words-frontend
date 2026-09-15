## Why

O frontend cresceu sem uma linguagem visual definida. Hoje o `src/index.css`
tem um punhado de variáveis de cor criadas sob demanda para a tela de status
(`--ok`, `--error`, `--pending`), e o `src/App.css` mistura tokens com estilos
de um componente específico. Não existe camada de componentes: cada tela
reescreve seus próprios botões e caixas.

O aplicativo está no começo, então este é o momento mais barato para fixar as
fundações. Cada tela nova construída sem elas aumenta o custo de padronizar
depois.

## What Changes

- **Tokens de design** organizados por papel semântico, substituindo as
  variáveis ad-hoc atuais: cor, tipografia, espaçamento, raio de borda, sombra
  e transição. Tema claro e escuro definidos sobre os mesmos nomes de token,
  de modo que nenhum componente precise saber qual tema está ativo.
- **Componentes base** em React, cobrindo o que um app de memorização
  precisa desde já: `Button`, `Input`, `Card`, `Badge`, `Alert`, `Spinner` e
  `ProgressBar`.
- **Galeria de componentes** — uma página que exibe a paleta e todos os
  componentes em seus estados, servindo de referência viva e de superfície de
  verificação visual.
- **`HealthStatus` refatorado** para consumir os componentes e tokens novos.
  Isso não é cosmético: é a prova de que o sistema atende a uma tela real, e
  não apenas a exemplos da galeria.
- Nenhuma dependência nova. CSS puro com custom properties, como já é a
  convenção do projeto.

Não faz parte desta mudança: componentes de domínio (baralho, cartão de
palavra, sessão de estudo), navegação/rotas, e componentes complexos como
modal, tooltip ou menu suspenso. Eles dependem de decisões de produto que
ainda não foram tomadas; o objetivo aqui é a fundação sobre a qual eles serão
construídos.

## Capabilities

### New Capabilities

- `design-system/tokens`: o vocabulário visual compartilhado — quais tokens
  existem, o que cada um significa, como se comportam nos temas claro e
  escuro, e as garantias de contraste.
- `design-system/components`: o conjunto de componentes base, seus estados,
  variantes, contrato de props e comportamento de acessibilidade, mais a
  galeria que os demonstra.

### Modified Capabilities

<!-- Nenhuma: o projeto ainda não tem specs em openspec/specs/, então não há
     requisito existente sendo alterado. A refatoração do HealthStatus troca a
     implementação, não o comportamento observável da tela. -->

## Impact

**Código afetado**

- `src/index.css` — passa a conter os tokens; as variáveis ad-hoc atuais
  (`--ok`, `--error`, `--pending`, `--bg`, `--surface`…) são substituídas por
  nomes semânticos.
- `src/App.css` — perde os estilos de componente, que migram para os
  componentes correspondentes.
- `src/components/` — ganha os componentes base e seus estilos.
- `src/components/HealthStatus.jsx` — reescrito sobre os novos componentes.
  Comportamento observável preservado: mesmos estados (`ok`, falha), mesmo
  endpoint, mesmo botão de reverificação.

**Sem impacto**

- `src/api/` e `src/config.js` não são tocados.
- Nenhuma dependência adicionada; `package.json` permanece igual.
- Build, lint e deploy seguem inalterados.

**Ponto que merece decisão explícita na revisão**

A paleta define a personalidade visual do produto e é a escolha mais
subjetiva desta mudança. O `design.md` propõe uma direção concreta com
justificativa; se a direção não agradar, trocar os valores dos tokens de cor
é uma edição localizada, porque nenhum componente referencia cor literal.
