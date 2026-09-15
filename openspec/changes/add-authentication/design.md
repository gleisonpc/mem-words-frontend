## Context

Ver `proposal.md` — Why. O que importa aqui é o que já está fixado dos dois
lados e não é negociável nesta mudança:

**O contrato do backend** (repositório `mem-words-backend`, já publicado):

| Endpoint | Corpo enviado | Resposta |
| :--- | :--- | :--- |
| `POST /auth/register` | `{ name, email, password }` | `201 { user }` — **sem tokens** |
| `POST /auth/login` | `{ email, password }` | `200 { user, accessToken, refreshToken, tokenType, expiresIn }` |
| `POST /auth/refresh` | `{ refreshToken }` | `200 { accessToken, refreshToken, tokenType, expiresIn }` — **sem `user`** |
| `POST /auth/logout` | `{ refreshToken }` | `204`, idempotente |
| `GET /users/me` | — | `200 { user }`, exige `Authorization: Bearer` |
| `GET /health` | — | `200 { status: "ok" }`, público |

Erros vêm sempre como `{ error, code, details? }`, com `details` sendo
`[{ field, message }]` nos `400` de validação e o `field` prefixado pela parte
da requisição: `"body.email"`, não `"email"`.

Regras de validação do backend, que o cliente precisa espelhar: nome de 2 a
120 caracteres; e-mail válido, com no máximo 255 caracteres, normalizado para
minúsculas e sem espaços nas pontas; senha de 8 a 72 caracteres (o limite
superior existe porque o bcrypt trunca em 72 bytes).

Três fatos do backend que moldam o desenho mais do que qualquer preferência
nossa:

1. O **access token é um JWT de 15 minutos** validado só pela assinatura.
2. O **refresh token é opaco, de uso único e rotativo**: cada renovação
   revoga o token apresentado e emite outro.
3. **Reapresentar um refresh token já gasto revoga todas as sessões ativas do
   usuário.** Não é um erro recuperável: é uma armadilha. Um duplo disparo
   acidental da renovação desloga a pessoa de todos os dispositivos.

**O que já existe no frontend**: design system completo (tokens + `Button`,
`Input`, `Card`, `Badge`, `Alert`, `Spinner`, `ProgressBar`), `src/config.js`
resolvendo `API_URL`, e `src/api/health.js` — a única chamada ao backend hoje,
com tempo limite e tradução de erro feitos à mão. Não há roteador, não há
gerência de estado global e não há test runner configurado.

## Goals / Non-Goals

**Goals:**

- Uma só porta de saída para o backend, de modo que tempo limite, formato de
  erro e envio do token sejam decididos em um lugar e não repetidos por tela.
- Renovação de token invisível para as telas e **comprovadamente de disparo
  único** dentro da aba.
- Uma sessão que sobrevive à recarga sem nunca ser presumida válida por estar
  guardada.
- Fronteira pública/protegida explícita, sem tela protegida piscando conteúdo
  antes da guarda decidir.

**Non-Goals:**

- Suíte de testes automatizados. O projeto não tem test runner, e introduzir
  um é uma decisão de infraestrutura própria, com peso comparável ao desta
  mudança. A verificação aqui é manual e roteirizada em `tasks.md`, como na
  mudança anterior. Registrado como risco abaixo.
- Renovação proativa por temporizador, sincronização de sessão entre abas e
  tela de edição de conta. Cada uma é uma adição posterior que não altera as
  specs desta.

## Decisions

### 1. Roteador: `react-router` em vez de solução própria

O `design.md` da mudança anterior deixou isto por escrito: *"instalar um
roteador só para servir uma página de referência interna seria uma dependência
e uma decisão de arquitetura de navegação cedo demais. Quando o app tiver rotas
de verdade, a galeria migra para uma delas."* Este é esse momento — há cinco
telas, uma fronteira de autorização entre elas e a necessidade de lembrar o
destino pretendido durante o desvio.

Escolhido `react-router` (v7, modo declarativo — `BrowserRouter`, `Routes`,
`Navigate`, `useNavigate`, `useLocation`, `Outlet`). É a referência de fato no
ecossistema React, e a guarda de rota com retorno ao destino pretendido é um
padrão documentado dela, não algo a inventar.

Alternativas consideradas:

- **Roteador próprio sobre a History API** (~60 linhas). Mantém a contagem de
  dependências em zero, o que o projeto valoriza. Recusado: o custo não está
  em resolver o caminho, está no resto — `popstate`, interceptar cliques em
  links, rotas aninhadas com layout, preservar o `state` do histórico para o
  destino pretendido. Seria código de infraestrutura que teríamos de manter
  sem ganho de produto.
- **Trocar tela por estado no contexto**, sem URL. Recusado de saída: as specs
  exigem telas endereçáveis e o botão voltar funcionando.
- **`wouter`** (menor). Recusado: economia de alguns quilobytes em troca de um
  ecossistema e uma documentação muito menores; a diferença não aparece em um
  aplicativo deste tamanho.

Modo declarativo e não o modo `data`/framework do v7: não precisamos de
carregadores de dados, ações de formulário ou renderização no servidor, e
adotá-los mudaria a forma de todo o aplicativo.

### 2. Tokens em `localStorage`, com o custo declarado

O backend devolve os dois tokens no corpo da resposta e não grava cookie
`httpOnly`. Dado esse contrato, o frontend só tem três opções:

| Onde | Sobrevive à recarga | Alcançável por XSS |
| :--- | :--- | :--- |
| Memória | não | não (só enquanto a página vive) |
| `sessionStorage` | sim, na mesma aba | sim |
| `localStorage` | sim, em qualquer aba | sim |

Escolhido `localStorage`. Justificativa: um aplicativo de memorização vive de
uso diário e curto — exigir login a cada abertura mataria o hábito que o
produto tenta criar. E as duas alternativas não compram segurança real:
`sessionStorage` é igualmente legível por script na origem, e manter só em
memória obrigaria o refresh token a ir para algum lugar de todo modo, ou a
sessão morreria a cada F5.

O que isso custa, explicitamente: **um XSS no frontend alcança o refresh token
e, com ele, a sessão.** A mitigação real não está neste repositório — está o
backend passar a emitir o refresh token como cookie `httpOnly`+`Secure`+
`SameSite`, com CORS por origem e credenciais habilitadas. Registrado nos
riscos, e é a evolução natural do par de repositórios; até lá, esta é a melhor
opção disponível, e não uma escolha por conveniência.

Toda leitura e escrita é envolvida em `try/catch`: em janela privativa ou com
dados de site bloqueados, o acesso ao armazenamento **lança**, e uma exceção aí
derrubaria a aplicação inteira. Falhando, a sessão passa a valer só enquanto a
página estiver aberta — degradação silenciosa, que é o comportamento correto.

Uma chave só, namespaced (`mem-words.auth`), com os dois tokens e o usuário
conhecido. Guardar o usuário evita um instante de "tela sem nome" antes do
`/users/me` responder; ele é tratado como dica de exibição, nunca como prova
de sessão.

### 3. A renovação mora no cliente HTTP, não no contexto de sessão

Tensão de arquitetura a resolver: o cliente HTTP precisa do token (para
enviar) e da renovação (para reagir ao `401`); o contexto de sessão precisa do
cliente (para chamar o backend). Se um importar o outro, há ciclo.

Solução: um terceiro módulo, `src/auth/tokenStore.js`, que é a única coisa que
conhece o armazenamento e mantém os tokens em memória. O cliente HTTP lê dele
e o atualiza; o contexto de sessão lê dele e se inscreve para ser avisado
quando a sessão morrer. Ninguém importa ninguém em círculo:

```
tela → contexto de sessão ─┐
                           ├→ api/*.js → api/client.js → tokenStore
       (inscreve-se) ──────┘                 │              ↑
                                             └──────────────┘
                                              renovação
```

O contexto de sessão continua sendo a única fonte de verdade **para as telas**,
como a spec exige — o `tokenStore` é o depósito, não o estado da interface, e
nenhuma tela o importa.

Alternativa considerada: a renovação no contexto, e o cliente recebendo uma
função de renovação por injeção. Recusado — a injeção teria de acontecer no
momento da montagem do provedor, deixando uma janela em que uma chamada não
teria como renovar, e amarraria uma camada de rede ao ciclo de vida do React.

### 4. Renovação reativa ao `401`, com uma única promessa em curso

Renovar ao receber `401`, e não por temporizador antes de expirar. Motivos: o
backend é a única autoridade sobre a validade do token, uma renovação por
temporizador gasta um refresh token a cada 15 minutos mesmo com a aba
esquecida aberta, e o `expiresIn` da resposta é uma string (`"15m"`) — usá-la
para agendar exigiria interpretá-la e confiar no relógio do cliente.

O disparo único é obtido guardando **a promessa** da renovação em curso, não um
booleano: quem chega durante a renovação aguarda a mesma promessa e recebe o
mesmo par de tokens. Um booleano só evitaria a segunda chamada, deixando a
segunda requisição sem saber quando prosseguir — que é justamente o caso em que
duas requisições expiram juntas.

Limites deliberados: **uma** repetição por requisição — a repetição fica fora
do `catch`, então uma segunda recusa sobe para quem chamou em vez de iniciar
outra renovação — e nunca renovar para uma resposta de endpoint público. Sem esses limites, credenciais
erradas no login — que também respondem `401` — dispararia uma renovação, e um
refresh recusado entraria em recursão.

Isso também é o que protege do modo estrito do React: no
desenvolvimento, o provedor monta, desmonta e monta de novo, e a restauração da
sessão roda duas vezes. Com a promessa compartilhada, a segunda montagem
aguarda a primeira renovação em vez de apresentar o mesmo refresh token outra
vez — que o backend leria como reuso e responderia revogando todas as sessões
do usuário. É o cenário mais provável de perder a sessão nesta mudança, e ele
aparece justamente em desenvolvimento.

### 5. Cadastro seguido de entrada, porque o backend não devolve tokens no registro

`POST /auth/register` responde `201 { user }` e nada mais. Para que o cadastro
deixe o usuário autenticado — como a spec exige — a operação de cadastro faz
duas chamadas em sequência: registra e, com as mesmas credenciais que já estão
em mãos, entra.

Se o registro passa e a entrada falha (backend caiu no meio), a conta existe e
a sessão não: a tela informa que a conta foi criada e pede para entrar, em vez
de sugerir que o cadastro falhou — repetir o cadastro devolveria `409` e
deixaria a pessoa sem entender por quê.

Alternativa: pedir ao backend que devolva tokens no `register`. É a solução
melhor e cabe em uma linha lá, mas é mudança no outro repositório; fica como
questão aberta, e a sequência de duas chamadas funciona hoje sem tocar no
backend.

### 6. Mapa de rotas

| Rota | Tela | Acesso |
| :--- | :--- | :--- |
| `/entrar` | Entrada | pública, redireciona com sessão |
| `/cadastro` | Cadastro | pública, redireciona com sessão |
| `/` | Início (identidade, saída) | protegida |
| `/diagnostico` | Status do backend | pública |
| `/galeria` | Galeria do design system | pública |
| `*` | Não encontrada | pública |

Nomes em português, como todo o texto de interface do projeto.

`/diagnostico` fica pública de propósito: é a ferramenta para descobrir que o
backend está fora do ar, e exigir sessão para alcançá-la a tornaria inútil
exatamente quando é necessária — a entrada também não funcionaria. `/galeria`
fica pública porque é referência de design, não dado de usuário.

A guarda é um componente de rota que lê o estado da sessão e decide entre
exibir a tela, exibir carregamento (enquanto a sessão está sendo determinada)
ou redirecionar para `/entrar` levando a localização pretendida no `state` do
histórico. O terceiro estado é o que impede o salto pela tela de entrada ao
recarregar uma rota protegida.

**Uma navegação tem um só dono.** Regra aprendida na verificação, depois de
dois defeitos com a mesma forma: a tela de entrada navegava para o destino
pretendido *e* a guarda de convidado navegava para a inicial, as duas
disparadas pela mesma mudança de sessão; e, na saída, a moldura autenticada
navegava para `/entrar` *e* a guarda redirecionava a partir da rota protegida.
Nos dois casos as navegações corriam juntas e a última a rodar ganhava — o
destino pretendido se perdia de forma intermitente, e a saída deixava a
própria tela protegida marcada como "destino a voltar". Por isso quem decide
para onde ir depois de uma mudança de sessão são **apenas as guardas**: as
telas só chamam a operação de sessão, e a saída não navega. A guarda protegida
também deixa de guardar destino quando a saída foi pedida pelo usuário — a
entrada seguinte é voluntária e leva à tela inicial.

A recomposição do destino inclui busca e fragmento, não só o caminho: quem
abriu um endereço com parâmetros quer voltar àquele endereço. É também o que
torna o retorno ao destino verificável hoje, com uma única rota protegida —
`/?buscar=palavra` é distinguível da tela inicial.

### 7. O erro é um objeto único, com os campos já mapeados

Uma classe `ApiError` com `status`, `code`, `message` e `fieldErrors`, e o
cliente converte tudo — erro do backend, falha de rede, tempo limite,
resposta ilegível — nela. As telas passam a ter um só formato para tratar.

O `fieldErrors` é um objeto simples do nome do campo para a mensagem, com o
prefixo do backend removido: `"body.email"` vira `email`, que é o nome que a
tela conhece. Fazer isso no cliente, e não em cada formulário, é o que impede
que a próxima tela com formulário reinvente o mapeamento.

Mensagens do backend são exibidas como vêm: são escritas em português e
pensadas para o usuário final (`"E-mail ou senha inválidos."`). Traduzi-las de
novo no frontend criaria duas fontes de texto para divergir.

### 8. `health.js` reescrito sobre o cliente, com o mesmo comportamento

`src/api/health.js` hoje duplica tempo limite e tratamento de erro. Passa a
usar o cliente, e a tela de diagnóstico não muda de comportamento — a spec
existente do design system exige isso, e a verificação está em `tasks.md`.
É também a prova de que o cliente atende a um consumidor público, sem token.

## Risks / Trade-offs

- **XSS alcança o refresh token em `localStorage`** → Nenhuma mitigação
  completa é possível deste lado com o contrato atual. Reduzimos a superfície:
  nenhuma renderização de HTML vindo do backend (`dangerouslySetInnerHTML`
  não é usado), token nunca em URL nem em log. A correção estrutural é o
  backend emitir cookie `httpOnly` — anotado em Open Questions.
- **Renovação concorrente entre abas revoga todas as sessões** → O disparo
  único vale por aba; duas abas cujos tokens expirem no mesmo instante ainda
  podem apresentar o mesmo refresh token. O backend trata isso como reuso e o
  usuário cai para a tela de entrada. Consequência aceita nesta mudança:
  perde-se a sessão, não dados, e o caminho de recuperação (entrar de novo)
  está claro. Mitigar de verdade pede sincronização entre abas por evento de
  armazenamento — fora do escopo, e registrado como o primeiro candidato a
  seguir.
- **Sem testes automatizados, a garantia de disparo único é verificada à mão**
  → É o risco mais desconfortável desta mudança, porque a falha que ele deixa
  passar é silenciosa e destrutiva (todas as sessões revogadas). `tasks.md`
  transforma a verificação em passos explícitos: contar as chamadas a
  `/auth/refresh` na aba de rede do navegador com o modo estrito ativo, e
  exercitar duas requisições expirando juntas encurtando
  `JWT_ACCESS_EXPIRES_IN` no backend local.
- **Backend hospedado hiberna e a primeira chamada demora** → O tempo limite
  atual, de 5 segundos, pode expirar em um backend acordando. Mantido para o
  diagnóstico (onde reportar "fora do ar" rápido é o objetivo) e usado um
  limite mais folgado para as operações de autenticação, onde um falso
  negativo custa mais que a espera.
- **Dependência nova** → `react-router` passa a ser mantida pelo projeto.
  Risco baixo e reversível: as rotas ficam concentradas em um módulo, e a
  guarda depende do contexto de sessão, não do roteador.
- **CORS** → Com o backend em `CORS_ORIGIN=*`, funciona hoje. Ao restringir,
  a origem da Vercel precisa entrar na lista, ou toda chamada passa a falhar
  como problema de conexão. Documentado no README nesta mudança.

## Open Questions

Nenhuma delas altera as specs, a abordagem ou as tarefas — todas são melhorias
no contrato do backend que valem a conversa depois que este fluxo estiver de pé:

- O `register` do backend poderia devolver o par de tokens, dispensando a
  entrada em sequência descrita na decisão 5.
- O refresh token poderia vir em cookie `httpOnly`, eliminando o risco
  central listado acima. Exige CORS por origem e credenciais habilitadas, dos
  dois lados.
- O `expiresIn` poderia vir em segundos, e não como `"15m"`, permitindo
  renovação proativa sem interpretar texto.
