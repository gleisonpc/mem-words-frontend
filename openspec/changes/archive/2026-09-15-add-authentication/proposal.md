## Why

O backend já expõe autenticação completa — cadastro, login por credenciais,
access token de vida curta, refresh token rotativo com detecção de reuso e
rotas de usuário protegidas — mas o frontend não tem nada disso: a aplicação
abre em uma tela de diagnóstico de saúde do backend, sem noção de quem está
usando o aplicativo.

Enquanto essa lacuna existe, nenhuma tela de produto pode ser construída: um
aplicativo de memorização é, por natureza, sobre *as palavras de alguém* — sem
identidade não há a quem atribuir progresso, listas ou histórico. Esta é a
mudança que destrava todas as seguintes.

## What Changes

- **Cliente HTTP único** para falar com o backend: resolve a URL base a partir
  de `src/config.js`, envia e recebe JSON, aplica tempo limite, anexa o
  `Authorization: Bearer` quando há sessão e traduz o formato de erro do
  backend (`{ error, code, details }`) em um erro de aplicação que as telas
  sabem exibir — inclusive a lista de campos inválidos de um `400`.
- **Sessão no frontend**: um contexto React que mantém o usuário autenticado,
  expõe as operações de entrar, cadastrar e sair, e é a única fonte de verdade
  sobre haver ou não sessão ativa.
- **Armazenamento dos tokens** em `localStorage`, de modo que recarregar a
  página ou voltar no dia seguinte não exija login de novo. A sessão guardada
  é validada contra o backend na abertura do aplicativo, e não presumida
  válida por existir no navegador.
- **Renovação automática e de disparo único**: uma resposta `401` em rota
  autenticada dispara uma tentativa de renovação e repete a requisição
  original. Como o refresh token do backend é de uso único e reapresentá-lo
  derruba *todas* as sessões do usuário, duas renovações simultâneas na mesma
  aba são um erro a evitar por construção, não um azar a tolerar.
- **Telas de entrada e de cadastro**, construídas sobre os componentes já
  existentes do design system, com validação no cliente espelhando as regras
  do backend, estados de carregamento, erro por campo e erro geral.
- **Rotas de verdade e guarda de rota**: o aplicativo passa a ter um mapa de
  rotas explícito (entrada, cadastro, início autenticado, galeria,
  diagnóstico). Rotas protegidas exigem sessão; quem chega sem sessão é levado
  à entrada e, após autenticar, retorna ao destino que tentou abrir.
- **Dependência nova**: `react-router`. A decisão está registrada no design da
  mudança anterior — "quando o app tiver rotas de verdade, a galeria migra
  para uma delas". Este é esse momento.

Fora do escopo: recuperação de senha, verificação de e-mail, login social,
edição e exclusão de conta (`PATCH`/`DELETE /users/:id`, que o backend já
oferece) e qualquer tela de domínio (baralhos, palavras, sessão de estudo).
São telas que dependem desta fundação, não o contrário.

## Capabilities

### New Capabilities

- `backend-integration/api-client`: o contrato de comunicação com o backend —
  resolução da URL base, formato de requisição e resposta, tempo limite,
  tradução de erros do backend e de falhas de rede, e como o token de acesso é
  anexado.
- `auth/session`: o ciclo de vida da sessão no frontend — entrar, cadastrar,
  restaurar uma sessão guardada, renovar tokens, sair e reagir à perda de
  sessão; onde os tokens ficam e quais são as garantias de disparo único da
  renovação.
- `auth/screens`: as telas de entrada e de cadastro — campos, validação no
  cliente, feedback de erro (geral e por campo), estados de carregamento e
  acessibilidade.
- `navigation/routing`: o mapa de rotas da aplicação, a distinção entre rota
  pública e protegida, o comportamento da guarda de rota e o retorno ao
  destino pretendido depois da autenticação.

### Modified Capabilities

<!-- Nenhuma. As duas specs existentes (design-system/tokens e
     design-system/components) continuam válidas palavra por palavra: elas
     exigem que a galeria seja "alcançável na aplicação em execução" e que a
     tela de status preserve seu comportamento, sem fixar por qual URL. A
     migração de `?galeria` para a rota `/galeria` e do status para
     `/diagnostico` troca o mecanismo de acesso, não o requisito. -->

## Impact

**Código afetado**

- `src/App.jsx` — deixa de ser a tela inicial e passa a montar o provedor de
  sessão e o mapa de rotas. A escolha da galeria por `?galeria` sai daqui.
- `src/api/` — ganha o cliente HTTP e os módulos de autenticação e de usuário;
  `src/api/health.js` é reescrito sobre o cliente, sem mudança de
  comportamento observável.
- `src/components/HealthStatus.jsx` — passa a ser o conteúdo da rota
  `/diagnostico`. Comportamento preservado.
- `src/components/Gallery.jsx` — passa a ser o conteúdo da rota `/galeria`.
- `src/config.js` — inalterado; `API_URL` continua a única fonte da URL base.
- `package.json` — ganha `react-router`.
- `README.md` — documenta as rotas, o fluxo de autenticação e o que é
  necessário no backend (CORS liberado para a origem do frontend).

**Integração entre os dois repositórios**

Nenhuma alteração no backend é necessária: os endpoints consumidos
(`POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`,
`POST /auth/logout`, `GET /users/me`) já existem e estão publicados. A única
configuração externa relevante é `CORS_ORIGIN` no backend, que hoje aceita
qualquer origem e, quando restringido, precisa incluir a origem do frontend.

**Ponto que merece decisão explícita na revisão**

Guardar o refresh token em `localStorage` é a única forma de manter a sessão
entre recargas com o contrato atual do backend, que devolve tokens no corpo da
resposta em vez de gravar cookie `httpOnly`. A consequência é conhecida: um XSS
no frontend alcança o token. O `design.md` detalha o que essa escolha compra,
o que ela custa e o que o backend teria de mudar para eliminar o risco.
