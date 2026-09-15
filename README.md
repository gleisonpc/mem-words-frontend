# mem-words

Aplicativo para ajudar a memorizar palavras — frontend em React + Vite.

## Requisitos

- Node.js 20.19+ ou 22.12+
- npm

## Configuração

A URL do backend vem de `src/config.js`, que traz um padrão para cada ambiente:

| Ambiente | Padrão |
| :--- | :--- |
| Desenvolvimento (`npm run dev`) | `http://localhost:8080` |
| Produção (`npm run build`) | `https://mem-words-backend.onrender.com` |

Com isso o projeto funciona sem configuração extra, tanto localmente quanto no
deploy.

### Apontando para outro backend

Defina `VITE_API_URL` — ela tem precedência sobre os padrões:

```bash
cp .env.example .env    # desenvolvimento; o .env não é versionado
```

Para o deploy, defina `VITE_API_URL` nas variáveis de ambiente do projeto na
Vercel e publique novamente.

> **Por que o padrão fica no código, e não em um `.env.production`?**
> O build da Vercel não aplica arquivos `.env` versionados no repositório —
> verificado na prática: com `.env.production` presente e correto, o site
> publicado reportava a variável como indefinida. Um padrão embutido no código
> é embutido no bundle em tempo de build e não depende do comportamento do
> host.

> Variáveis lidas pelo Vite precisam do prefixo `VITE_` e são embutidas no
> bundle em tempo de build — não guarde segredos nelas. A URL do backend é
> pública, por isso pode ficar no código.

> O frontend é publicado na **Vercel** e o backend no **Render**. Como são
> origens diferentes, o backend precisa liberar CORS para a origem do frontend.

### Diagnóstico

A tela `/diagnostico` informa de onde veio a URL deste build:

| O que aparece | O que significa |
| :--- | :--- |
| `Origem: VITE_API_URL` | O build recebeu a variável de ambiente. |
| `Origem: padrão de produção` | Build de produção usando o padrão de `src/config.js`. |
| `Origem: padrão de desenvolvimento` | Build de desenvolvimento apontando para `localhost`. |
| `falha na conexão` com endpoint correto | A URL está certa; o problema é o backend (fora do ar ou sem CORS liberado). |

## Scripts

```bash
npm install      # instala as dependências
npm run dev      # servidor de desenvolvimento em http://localhost:5173
npm run build    # gera o bundle de produção em dist/
npm run preview  # serve o bundle de produção localmente
npm run lint     # analisa o código com oxlint
```

## Rotas

| Rota | Tela | Acesso |
| :--- | :--- | :--- |
| `/entrar` | Entrada por e-mail e senha | pública; com sessão ativa, redireciona para `/` |
| `/cadastro` | Criação de conta | pública; com sessão ativa, redireciona para `/` |
| `/` | Início da área autenticada | **protegida** |
| `/diagnostico` | Status da conexão com o backend | pública |
| `/galeria` | Galeria do design system | pública |
| qualquer outra | Página não encontrada | pública |

Uma rota protegida só é exibida com sessão ativa. Quem chega sem sessão é
levado a `/entrar` e, depois de autenticar, volta ao endereço que tentou
abrir. Enquanto a sessão guardada está sendo confirmada, a tela mostra
carregamento — e não a tela de entrada, que apareceria e desapareceria a cada
recarga.

`/diagnostico` é pública de propósito: é a ferramenta para descobrir que o
backend está fora do ar, o que inclui o caso em que a entrada não funciona
por isso.

> **Deploy:** as rotas são resolvidas no navegador, então o host precisa
> devolver `index.html` para qualquer endereço — sem isso, abrir
> `/entrar` direto responde 404 (verificado servindo `dist/` em um servidor
> estático puro). É o que o `vercel.json` na raiz faz, com uma regra de
> reescrita para `/index.html`.

> A galeria era alcançável por `?galeria` na URL. Agora que a aplicação tem
> rotas de verdade, ela mora em `/galeria`; o parâmetro antigo não tem mais
> efeito.

## Autenticação

O backend ([mem-words-backend](https://github.com/gleisonpc/mem-words-backend))
emite dois tokens no login, e este frontend consome os endpoints
`POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`,
`POST /auth/logout` e `GET /users/me`.

| Token | O que é | Onde vai |
| :--- | :--- | :--- |
| **Access token** | JWT curto (15min) | cabeçalho `Authorization: Bearer` de cada chamada autenticada |
| **Refresh token** | valor opaco, de uso único | corpo das chamadas de renovação e de saída |

**Onde os tokens ficam guardados.** Em `localStorage`, sob a chave
`mem-words.auth`, junto com os dados do usuário. É o que permite recarregar a
página sem entrar de novo. A contrapartida é conhecida e aceita: um XSS no
frontend alcançaria o token, porque o backend devolve os tokens no corpo da
resposta em vez de gravar um cookie `httpOnly`. A decisão, suas alternativas e
o que o backend teria de mudar estão registrados em
`openspec/changes/archive/*-add-authentication/design.md`.

Quando o armazenamento não está disponível — janela privativa, dados de site
bloqueados —, a aplicação continua funcionando; a sessão passa a valer apenas
enquanto a página estiver aberta.

**Sessão guardada não é sessão válida.** Ao abrir a aplicação, os tokens
guardados são conferidos contra `GET /users/me` antes de a sessão ser
considerada ativa: eles podem estar expirados, revogados ou pertencer a uma
conta excluída. Se o backend estiver inacessível, os tokens **não** são
apagados e a tela informa falha de conexão — uma queda de rede não deslogaria
ninguém.

**Renovação automática.** Uma resposta `401` em chamada autenticada dispara
uma renovação e repete a requisição original uma única vez. Como o refresh
token é de uso único e reapresentá-lo faz o backend revogar todas as sessões
do usuário, renovações concorrentes na mesma aba convergem para uma única
chamada — quem chega durante uma renovação aguarda a mesma promessa.

> Duas abas cujos tokens expirem no mesmo instante ainda podem apresentar o
> mesmo refresh token, o que o backend trata como reuso e derruba a sessão. O
> caminho de recuperação é entrar de novo; sincronizar as abas é melhoria
> registrada para depois.

## Tela de diagnóstico

`/diagnostico` consulta o endpoint `GET /health` do backend assim que carrega
e mostra o resultado:

- **ok** — o backend respondeu com sucesso; o corpo da resposta é exibido
  abaixo do status.
- **falha na conexão** — o backend não respondeu, retornou um código de erro
  ou excedeu o tempo limite de 5 segundos; o motivo é exibido abaixo do status.

O botão *Verificar novamente* repete a consulta sem recarregar a página.

### Estrutura

```
src/
├── api/
│   ├── ApiError.js            # falha de chamada em formato único
│   ├── client.js              # cliente HTTP: tempo limite, erros, renovação
│   ├── auth.js                # /auth/register, /login, /refresh, /logout
│   ├── users.js               # /users/me
│   └── health.js              # /health
├── auth/
│   ├── tokenStore.js          # tokens em memória, espelhados no localStorage
│   ├── session.js             # contexto, estados e erro de cadastro sem sessão
│   ├── AuthProvider.jsx       # ciclo de vida da sessão
│   ├── useAuth.js             # acesso das telas à sessão
│   ├── useAuthForm.js         # estado comum dos formulários de autenticação
│   ├── validation.js          # regras espelhando as do backend
│   ├── RequireAuth.jsx        # guarda de rota
│   └── GuestOnly.jsx          # mantém quem tem sessão fora de entrar/cadastro
├── components/                # design system, moldura autenticada, status
├── pages/                     # entrada, cadastro, início, diagnóstico, 404
├── routes.jsx                 # mapa de rotas
├── config.js                  # leitura de VITE_API_URL
└── App.jsx                    # provedor de sessão + roteador
```

> Como o backend fica em outra origem, ele precisa liberar CORS para a origem
> do frontend. No backend isso é a variável `CORS_ORIGIN` (lista separada por
> vírgula); hoje ela aceita qualquer origem, e ao ser restringida precisa
> incluir a origem publicada na Vercel — caso contrário o navegador bloqueia
> as requisições e toda tela passa a informar falha de conexão.

## OpenSpec

O repositório usa [OpenSpec](https://github.com/Fission-AI/OpenSpec) para
desenvolvimento orientado a especificações. Para instalar a CLI:

```bash
npm install -g @fission-ai/openspec
```

As especificações ficam em `openspec/` e os comandos `/opsx:*` estão
disponíveis no Claude Code.
