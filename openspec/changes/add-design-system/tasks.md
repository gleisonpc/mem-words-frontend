## 1. Fundação de tokens

- [x] 1.1 Criar `src/styles/tokens.css` com os tokens primitivos de cor (escala
      de cinzas e as famílias índigo, verde, âmbar, vermelho e azul) usando os
      valores da tabela de `design.md`; verificar que o arquivo define apenas
      primitivos, sem nenhum nome semântico.
- [x] 1.2 Adicionar ao mesmo arquivo os tokens semânticos do tema claro
      (`--color-bg`, `--color-surface`, `--color-text`, `--color-primary`, os
      pares de estado etc.) apontando para os primitivos; verificar que nenhum
      token semântico contém valor de cor literal.
- [x] 1.3 Adicionar o bloco `@media (prefers-color-scheme: dark)` reapontando
      os mesmos nomes semânticos para outros primitivos; verificar por
      comparação que os dois temas definem exatamente o mesmo conjunto de
      nomes, sem sobra nem falta de nenhum lado.
- [x] 1.4 Adicionar as escalas não cromáticas — espaçamento, tamanho e peso de
      fonte, raio, sombra e transição — conforme `design.md`; verificar que
      cada escala tem os degraus especificados.
- [x] 1.5 Adicionar o bloco `@media (prefers-reduced-motion: reduce)` que zera
      as durações de transição; verificar ativando a preferência no navegador
      e observando que as transições deixam de ocorrer.
- [x] 1.6 Importar `tokens.css` em `src/index.css` e reescrever os estilos
      globais (`body`, `box-sizing`, tipografia base) sobre os tokens novos;
      verificar que a aplicação ainda carrega com `npm run dev`.

## 2. Verificação de contraste

- [x] 2.1 Medir, com a fórmula de contraste da WCAG 2.1, cada par listado em
      `design.md` — texto sobre fundo e sobre superfície, texto suave, texto
      sobre botão primário, cada cor de estado sobre seu fundo, borda de campo
      e anel de foco — nos dois temas; verificar que todo par de texto alcança
      ao menos 4.5:1 e todo par não textual ao menos 3:1, corrigindo os
      valores dos primitivos até que passem.

## 3. Componentes base

- [x] 3.1 Criar `Button` com as variantes primária, secundária, ghost e
      perigo, dois tamanhos e os estados hover, foco, ativo, desabilitado e
      carregando; verificar na galeria que cada combinação de variante e
      estado renderiza, que o botão carregando não dispara a ação ao ser
      clicado e que expõe estado de ocupado a tecnologias assistivas.
- [x] 3.2 Criar `Input` com rótulo, texto de ajuda e mensagem de erro, com o
      rótulo associado ao controle e o erro associado ao campo; verificar que
      clicar no rótulo move o foco para o campo e que o campo em erro é
      marcado como inválido, com a mensagem referenciada e não apenas
      posicionada ao lado.
- [x] 3.3 Criar `Card` com título opcional; verificar na galeria que o
      conteúdo aparece sobre superfície distinta do fundo da página nos dois
      temas.
- [x] 3.4 Criar `Badge` com as variantes neutra, sucesso, atenção, erro e
      informação; verificar que cada variante identifica o estado pelo texto,
      e não apenas pela cor.
- [x] 3.5 Criar `Alert` com as variantes de sucesso, atenção, erro e
      informação e título opcional, anunciável por tecnologias assistivas sem
      exigir foco; verificar que um alerta inserido após uma ação é anunciado.
- [x] 3.6 Criar `Spinner` com rótulo textual acessível; verificar que o estado
      de carregamento é perceptível sem depender da animação.
- [x] 3.7 Criar `ProgressBar` expondo valor atual, mínimo e máximo, limitando
      valores fora do intervalo; verificar com valores abaixo do mínimo e
      acima do máximo que a barra permanece dentro do intervalo e o layout não
      quebra.
- [x] 3.8 Definir o estilo de foco visível compartilhado, aplicado a todo
      componente interativo e restrito à navegação por teclado; verificar
      percorrendo a galeria com Tab que cada elemento focado mostra o
      indicador, e que clicar com o mouse não o exibe.

## 4. Galeria

- [x] 4.1 Criar a página de galeria exibindo a paleta de tokens de cor e todos
      os componentes em suas variantes e estados; verificar que cada
      componente do grupo 3 aparece.
- [x] 4.2 Ligar a galeria ao parâmetro `?galeria` na URL, conforme
      `design.md`; verificar que a URL com o parâmetro abre a galeria e que sem
      ele o app renderiza a tela normal.
- [x] 4.3 Revisar a galeria nos temas claro e escuro; verificar que todos os
      exemplos permanecem legíveis nos dois.

## 5. Refatoração da tela existente

- [x] 5.1 Registrar o comportamento atual de `HealthStatus` antes de mexer —
      estados exibidos, textos, endpoint e origem — para servir de referência
      de comparação.
- [x] 5.2 Reescrever `HealthStatus` sobre `Card`, `Badge`, `Button` e
      `Alert`; verificar contra o registro de 5.1 que os estados de sucesso e
      falha, o detalhe, o endpoint, a origem e o botão de reverificação
      continuam idênticos em comportamento.
- [x] 5.3 Remover de `src/App.css` os estilos que migraram para os
      componentes e as variáveis ad-hoc substituídas (`--ok`, `--error`,
      `--pending` e demais); verificar por busca no projeto que nenhuma
      referência aos nomes antigos permanece.

## 6. Verificação final

- [x] 6.1 Rodar `npm run lint` e `npm run build`; verificar que ambos passam
      sem aviso.
- [x] 6.2 Exercitar a aplicação no navegador nos dois temas — tela de status e
      galeria — com o backend disponível e indisponível; verificar que os
      estados de sucesso e de falha aparecem corretamente e que nada regrediu
      em relação ao registro de 5.1.
- [x] 6.3 Confirmar que nenhuma dependência foi adicionada; verificar que
      `package.json` não mudou.
