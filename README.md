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

A própria tela informa de onde veio a URL deste build:

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

## Tela inicial

A tela inicial consulta o endpoint `GET /health` do backend (usando
`VITE_API_URL`) assim que carrega e mostra o resultado:

- **ok** — o backend respondeu com sucesso; o corpo da resposta é exibido
  abaixo do status.
- **falha na conexão** — o backend não respondeu, retornou um código de erro
  ou excedeu o tempo limite de 5 segundos; o motivo é exibido abaixo do status.

O botão *Verificar novamente* repete a consulta sem recarregar a página.

### Estrutura

```
src/
├── api/health.js              # chamada ao endpoint /health
├── components/HealthStatus.jsx # exibição do status da conexão
├── config.js                  # leitura de VITE_API_URL
└── App.jsx                    # tela inicial
```

> Se o backend estiver em outra origem, ele precisa liberar CORS para a origem
> do frontend, caso contrário o navegador bloqueia a requisição e a tela mostra
> "falha na conexão".

## OpenSpec

O repositório usa [OpenSpec](https://github.com/Fission-AI/OpenSpec) para
desenvolvimento orientado a especificações. Para instalar a CLI:

```bash
npm install -g @fission-ai/openspec
```

As especificações ficam em `openspec/` e os comandos `/opsx:*` estão
disponíveis no Claude Code.
