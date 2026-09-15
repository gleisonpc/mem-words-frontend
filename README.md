# mem-words

Aplicativo para ajudar a memorizar palavras — frontend em React + Vite.

## Requisitos

- Node.js 20.19+ ou 22.12+
- npm

## Configuração

O frontend precisa saber onde o backend está rodando. Isso é feito pela
variável de ambiente `VITE_API_URL`.

### Desenvolvimento

```bash
cp .env.example .env
```

Depois ajuste o valor em `.env` conforme o seu ambiente:

```
VITE_API_URL=http://localhost:8080
```

O arquivo `.env` não é versionado. Caso a variável não esteja definida, o
aplicativo usa `http://localhost:8080` como padrão.

### Produção

O arquivo `.env.production` é versionado e já aponta para o backend publicado
no Render:

```
VITE_API_URL=https://mem-words-backend.onrender.com
```

O Vite carrega esse arquivo automaticamente em `npm run build`, então o deploy
não precisa de configuração extra. Para apontar para outro backend sem alterar
o repositório, basta definir `VITE_API_URL` no ambiente de build (por exemplo,
no painel do Render): variáveis do ambiente têm precedência sobre os arquivos
`.env`.

> Variáveis lidas pelo Vite precisam do prefixo `VITE_` e são embutidas no
> bundle em tempo de build — não guarde segredos nelas. A URL do backend é
> pública, por isso pode ser versionada.

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
