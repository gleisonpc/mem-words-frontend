## 1. Proxy de borda

- [x] 1.1 Em `vercel.json`, adicionar `{ "source": "/api/:path*", "destination": "https://mem-words-backend.onrender.com/:path*" }` **antes** da regra de fallback do SPA; verificar por leitura que a ordem está correta (a regra de `/api` precisa vir primeiro).
- [x] 1.2 Em `src/config.js`, trocar `PRODUCTION_API_URL` de
      `'https://mem-words-backend.onrender.com'` para `'/api'`; verificar que
      `normalize('/api')` continua `'/api'` (sem barra final a remover).

## 2. Verificação local do build

- [x] 2.1 Rodar `npm run build` e confirmar que `/api` aparece no bundle de
      produção como valor de `API_URL`, no lugar da URL absoluta do Render.
- [x] 2.2 Rodar `npm run lint`; confirmar que passa sem aviso.
- [x] 2.3 Confirmar que `npm run dev` continua resolvendo para
      `http://localhost:8080` (ou o valor de `VITE_API_URL`) — o ambiente de
      desenvolvimento não deve ser afetado pela mudança do padrão de
      produção.

## 3. Verificação contra o preview publicado

- [x] 3.1 Publicar a mudança (PR) e aguardar o preview da Vercel. Feito
      (PR #8), mas o preview desta conta está atrás do Vercel Deployment
      Protection (SSO) — root e `/api/health` do preview redirecionam para
      `vercel.com/sso-api` mesmo sem tocar em nada desta mudança, então
      nenhuma ferramenta automatizada sem sessão da Vercel alcança o
      preview. Combinado com o usuário: mergear e verificar contra produção
      diretamente (mesma disciplina das mudanças anteriores).
- [x] 3.2 Contra produção, confirmado que `/api/health` responde
      `{"status":"ok"}`, igual ao backend direto — prova de que o
      `rewrite` está encaminhando corretamente.
- [x] 3.3 Repetido, contra produção, a reprodução do problema original:
      Chromium com `--test-third-party-cookie-phaseout`, cadastro, e
      confirmado que o cookie do token de renovação **é** gravado. Isso
      revelou um bug novo (ver nota abaixo) que foi corrigido no backend
      antes deste item passar de fato.
- [x] 3.4 Com o mesmo bloqueio de terceiros ativo, recarregada a página
      após o cadastro: a sessão é restaurada (tela autenticada, dados do
      usuário) — o cenário exato que o usuário reportou quebrado em
      produção agora funciona.
- [x] 3.5 Confirmado, por `context.cookies()`, que o domínio do cookie é
      `mem-words-frontend.vercel.app` (o do frontend), não mais o do
      Render.

**Bug encontrado durante 3.3/3.4, fora do escopo desta mudança de
frontend:** o cookie do token de renovação era emitido pelo backend com
`Path=/auth`; com o proxy, a chamada de renovação passou a ser
`/api/auth/refresh`, um caminho que não começa com `/auth`, então o
navegador parava de enviar o cookie e a renovação respondia `401` — a
sessão continuava caindo a cada F5, por um motivo novo. Corrigido no
backend alargando o cookie para `Path=/` (mem-words-backend PR #6, mudança
OpenSpec `widen-refresh-cookie-path`), sem qualquer alteração adicional
neste repositório.

## 4. Verificação final

- [x] 4.1 Confirmado que nenhuma dependência foi adicionada; `package.json`
      inalterado.
- [x] 4.2 Rodar `openspec validate --specs` e confirmar que
      `backend-integration/api-client` passa.
