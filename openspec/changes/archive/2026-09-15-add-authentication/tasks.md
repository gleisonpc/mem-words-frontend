## 1. Dependência e estrutura

- [x] 1.1 Instalar `react-router` e verificar que `npm install` conclui sem
      aviso de par incompatível com React 19 e que `package.json` e
      `package-lock.json` registram a versão instalada.
- [x] 1.2 Criar os diretórios `src/auth/` e `src/pages/` e verificar que a
      aplicação continua subindo com `npm run dev` antes de qualquer mudança
      de comportamento.

## 2. Cliente HTTP

- [x] 2.1 Criar `src/api/ApiError.js` com `status`, `code`, `message` e
      `fieldErrors`; verificar que uma instância construída a partir de um
      corpo de erro do backend (`{ error, code, details }`) expõe a mensagem
      geral e o mapa de campos com o prefixo `body.` removido.
- [x] 2.2 Criar `src/api/client.js` montando a URL a partir de `API_URL`,
      serializando e aceitando JSON, com tempo limite por requisição;
      verificar contra o backend local que uma chamada de sucesso devolve o
      corpo parseado e que uma resposta `204` devolve sucesso sem dados, sem
      erro de leitura.
- [x] 2.3 Fazer o cliente converter em `ApiError` toda falha — erro do
      backend, corpo de erro ilegível, falha de rede e tempo limite;
      verificar com o backend desligado que a falha chega como `ApiError` com
      mensagem apresentável, e com o backend respondendo `400` que
      `fieldErrors` traz o campo recusado.
- [x] 2.4 Fazer o cliente anexar `Authorization: Bearer` nas chamadas
      marcadas como autenticadas e nunca nas públicas; verificar na aba de
      rede do navegador que `/users/me` envia o cabeçalho e que `/health`,
      `/auth/login`, `/auth/register`, `/auth/refresh` e `/auth/logout` não
      enviam, e que o token não aparece em nenhuma URL.

## 3. Depósito de tokens

- [x] 3.1 Criar `src/auth/tokenStore.js` guardando os tokens e o usuário
      conhecido em memória e espelhando-os em uma única chave
      `mem-words.auth` do `localStorage`; verificar que recarregar a página
      com sessão ativa recupera os tokens sem nova entrada.
- [x] 3.2 Envolver toda leitura e escrita do armazenamento em `try/catch`;
      verificar em janela privativa com dados de site bloqueados que a
      aplicação carrega e opera normalmente, sem exceção no console e sem
      erro exibido ao usuário.
- [x] 3.3 Expor no depósito a notificação de sessão perdida, para que o
      contexto se inscreva; verificar que limpar os tokens pelo depósito
      avisa o inscrito exatamente uma vez.

## 4. Renovação automática

- [x] 4.1 Implementar no cliente a reação ao `401` em chamada autenticada:
      renovar e repetir a requisição original uma única vez; verificar,
      encurtando `JWT_ACCESS_EXPIRES_IN` para `10s` no backend local, que
      após a expiração uma chamada a `/users/me` resulta em
      `/auth/refresh` seguido da repetição bem-sucedida, e que a tela recebe
      só o resultado final.
- [x] 4.2 Garantir que a renovação não é tentada para endpoints públicos nem
      para a própria renovação; verificar que credenciais erradas no login
      respondem `401` sem disparar `/auth/refresh` na aba de rede.
- [x] 4.3 Implementar o disparo único guardando a promessa da renovação em
      curso; verificar com `JWT_ACCESS_EXPIRES_IN=10s` e duas chamadas
      autenticadas disparadas juntas após a expiração que a aba de rede
      mostra **uma** requisição a `/auth/refresh` e que as duas chamadas
      terminam com sucesso.
- [x] 4.4 Fazer a renovação recusada encerrar a sessão localmente e reportar
      a chamada original como falha de autenticação; verificar, adulterando
      o refresh token guardado no `localStorage`, que a aplicação cai para a
      tela de entrada informando que a sessão expirou, em vez de exibir tela
      protegida em erro.
- [x] 4.5 Verificar o caso do modo estrito de desenvolvimento: com o backend
      local, `JWT_ACCESS_EXPIRES_IN=10s` e sessão guardada expirada,
      recarregar a rota protegida e confirmar na aba de rede que
      `/auth/refresh` é chamado uma única vez e que a sessão continua ativa —
      duas chamadas revogariam todas as sessões do usuário por detecção de
      reuso.

## 5. Operações de autenticação

- [x] 5.1 Criar `src/api/auth.js` com entrada, cadastro, renovação e saída, e
      `src/api/users.js` com a consulta do usuário autenticado; verificar
      cada função contra o backend local comparando o corpo enviado com o
      contrato registrado em `design.md`.
- [x] 5.2 Reescrever `src/api/health.js` sobre o cliente, preservando o
      comportamento: mesmo endpoint, mesmo tempo limite de 5 segundos, mesmo
      formato de retorno consumido pela tela; verificar com backend
      disponível e desligado que a tela de diagnóstico exibe sucesso e falha
      exatamente como antes.

## 6. Contexto de sessão

- [x] 6.1 Criar `src/auth/AuthProvider.jsx` (com `src/auth/session.js` para o
      contexto e as constantes, separados porque a regra de lint do projeto
      recusa um arquivo que exporta componentes e não-componentes juntos) com
      o provedor e os estados
      "determinando", "autenticado" e "sem sessão"; verificar que uma tela
      consumidora observa "determinando" na abertura e nunca conclui
      identidade antes da confirmação.
- [x] 6.2 Criar `src/auth/useAuth.js` como único acesso das telas à sessão;
      verificar por busca no projeto que nenhuma tela importa o depósito de
      tokens nem lê o `localStorage` diretamente.
- [x] 6.3 Implementar a restauração de sessão na montagem: com tokens
      guardados, confirmar contra o usuário autenticado no backend antes de
      considerar a sessão válida; verificar que uma sessão guardada válida
      autentica sem passar pela entrada e que tokens inválidos são
      descartados, levando a "sem sessão".
- [x] 6.4 Distinguir, na restauração, backend inacessível de sessão inválida;
      verificar com o backend desligado que a sessão guardada não é apagada e
      a falha é apresentada como problema de conexão.
- [x] 6.5 Implementar entrar e cadastrar no contexto, com o cadastro seguido
      de entrada conforme a decisão 5 de `design.md`; verificar que um
      cadastro válido deixa o usuário autenticado sem digitar as credenciais
      de novo, e que um `409` de e-mail repetido não altera o estado da
      sessão.
- [x] 6.6 Tratar o caso de registro aceito e entrada seguinte falha;
      verificar, desligando o backend entre as duas chamadas, que a tela
      informa que a conta foi criada e pede para entrar, em vez de sugerir
      falha no cadastro.
- [x] 6.7 Implementar sair, revogando no backend e descartando estado e
      tokens locais mesmo quando a chamada falha; verificar com o backend
      desligado que a saída conclui e leva a uma rota pública.
- [x] 6.8 Inscrever o contexto na notificação de sessão perdida do depósito;
      verificar que uma renovação recusada durante o uso leva à tela de
      entrada com aviso de sessão expirada, sem recarregar a página.

## 7. Rotas e guarda

- [x] 7.1 Criar o mapa de rotas conforme a tabela da decisão 6 de
      `design.md` (`/entrar`, `/cadastro`, `/`, `/diagnostico`, `/galeria` e
      rota não encontrada); verificar abrindo cada URL diretamente no
      navegador que a tela correspondente aparece e que voltar e avançar
      funcionam sem recarregar a aplicação.
- [x] 7.2 Reescrever `src/App.jsx` para montar o provedor de sessão e o
      roteador, removendo a escolha da galeria por `?galeria`; verificar que
      a URL com o parâmetro antigo não tem efeito e que `/galeria` exibe a
      galeria.
- [x] 7.3 Criar a guarda de rota com os três estados — exibir, carregar,
      redirecionar; verificar que uma rota protegida aberta sem sessão leva à
      entrada sem exibir nada do conteúdo protegido, e que recarregar uma
      rota protegida com sessão válida exibe carregamento e nunca a tela de
      entrada.
- [x] 7.4 Implementar o retorno ao destino pretendido pelo `state` do
      histórico; verificar que abrir uma rota protegida sem sessão e então
      autenticar leva à rota pretendida, e que entrar por vontade própria
      leva à tela inicial.
- [x] 7.5 Redirecionar quem tem sessão ativa para fora de `/entrar` e
      `/cadastro`; verificar que abrir essas URLs autenticado leva à tela
      inicial.
- [x] 7.6 Garantir que uma mudança de sessão produza uma única navegação, com
      as guardas como único dono da decisão (as telas e a saída não navegam);
      verificar, repetindo o fluxo de desvio e autenticação várias vezes, que
      o destino pretendido é alcançado sempre, e não de forma intermitente,
      e que sair e entrar de novo leva à tela inicial.
- [x] 7.7 Criar a tela de rota não encontrada com caminho de volta;
      verificar que uma URL inexistente a exibe, em vez de tela em branco.

## 8. Telas de entrada e cadastro

- [x] 8.1 Criar `src/pages/LoginPage.jsx` com e-mail, senha, ação de entrar e
      caminho para o cadastro, montada sobre `Card`, `Input`, `Button` e
      `Alert`; verificar por busca no arquivo e no seu CSS que nenhum valor
      visual literal foi introduzido.
- [x] 8.2 Criar `src/pages/RegisterPage.jsx` com nome, e-mail, senha, ação de
      criar conta e caminho para a entrada; verificar que um cadastro válido
      leva à área autenticada.
- [x] 8.3 Implementar a validação no cliente espelhando as regras do backend
      registradas em `design.md` — obrigatoriedade, formato de e-mail, nome de
      2 a 120 e senha de 8 a 72 caracteres; verificar na aba de rede que uma
      submissão recusada localmente não gera requisição alguma.
- [x] 8.4 Exibir os erros do backend no campo correspondente, usando o mapa
      de campos do `ApiError`; verificar enviando um e-mail que passa na
      validação local e é recusado pelo backend que a mensagem aparece no
      campo de e-mail, e não como erro geral.
- [x] 8.5 Exibir como erro geral, anunciado a tecnologias assistivas, o que
      não pertence a um campo — credenciais inválidas, e-mail já cadastrado e
      falha de conexão; verificar com o backend desligado que a tela informa
      falha de conexão, e não credenciais erradas.
- [x] 8.6 Implementar o estado de envio em curso bloqueando reenvio;
      verificar que acionar a ação repetidamente durante o envio gera uma só
      requisição, e que uma falha libera o formulário para nova tentativa.
- [x] 8.7 Garantir a acessibilidade dos formulários — rótulo associado,
      propósito dos campos declarado para preenchimento automático, senha
      oculta e envio por Enter; verificar percorrendo as duas telas só com o
      teclado que é possível preencher e enviar, com foco visível em cada
      elemento.

## 9. Área autenticada

- [x] 9.1 Criar `src/pages/HomePage.jsx` exibindo quem está autenticado;
      verificar que o nome e o e-mail vindos do backend aparecem após entrar.
- [x] 9.2 Oferecer a ação de sair alcançável de qualquer tela protegida;
      verificar que acioná-la encerra a sessão, leva a uma rota pública e que
      voltar pelo histórico não devolve a tela protegida com conteúdo.
- [x] 9.3 Mover a tela de status do backend para `/diagnostico` como rota
      pública e a galeria para `/galeria`; verificar sem sessão que as duas
      abrem normalmente.

## 10. Documentação e verificação final

- [x] 10.1 Atualizar o `README.md` com o mapa de rotas, o fluxo de
      autenticação, onde os tokens ficam guardados e a exigência de
      `CORS_ORIGIN` no backend incluir a origem do frontend; verificar que a
      seção de estrutura de `src/` reflete os arquivos criados.
- [x] 10.2 Garantir que o host devolve `index.html` para qualquer endereço,
      sem o que um endereço direto de rota responde 404 em produção;
      verificar servindo `dist/` em um servidor estático sem fallback e
      observando a diferença entre `/` e `/entrar`.
- [x] 10.3 Rodar `npm run lint` e `npm run build`; verificar que ambos passam
      sem aviso.
- [x] 10.4 Exercitar o fluxo completo contra o backend local nos dois temas —
      cadastrar, sair, entrar, recarregar em rota protegida, abrir rota
      protegida sem sessão e voltar ao destino, e sair; verificar que cada
      passo se comporta conforme as specs desta mudança.
- [x] 10.5 Exercitar o mesmo fluxo com o backend desligado; verificar que
      toda tela informa falha de conexão de forma distinguível de credenciais
      inválidas, e que nenhuma tela fica em carregamento indefinido.
