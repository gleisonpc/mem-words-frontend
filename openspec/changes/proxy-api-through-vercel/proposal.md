## Why

Em produção, recarregar a página derruba a sessão sempre — reproduzido e
confirmado com Playwright contra a produção real, com o bloqueio de cookies
de terceiros do Chromium ativado (`--test-third-party-cookie-phaseout`, a
mesma simulação usada por quem testa a migração para o mundo sem cookies de
terceiros): o cookie do token de renovação **nunca chega a ser gravado pelo
navegador**, nem uma vez, logo após o login.

A causa: frontend (`mem-words-frontend.vercel.app`) e backend
(`mem-words-backend.onrender.com`) são domínios registráveis diferentes. Para
o navegador, isso torna o cookie do token de renovação um cookie de
terceiros, não importa que ele seja `SameSite=None; Secure`. E bloquear
cookies de terceiros deixou de ser exceção: é o padrão do Safari desde a
versão 13, é para onde o Chrome está migrando, e é o que o Firefox já faz
para domínios classificados como rastreadores. A mudança anterior
(`trust-httponly-refresh-cookie`) resolveu o vazamento por XSS; esta resolve
uma consequência que só aparece em navegador real, fora de um ambiente de
teste automatizado com política de cookies mais permissiva.

## What Changes

- Chamadas ao backend em produção passam a ir por um caminho da própria
  origem do frontend (`/api/...`), que a Vercel redireciona
  internamente (`rewrite`, não redirecionamento visível ao navegador) para o
  backend no Render.
- Do ponto de vista do navegador, a requisição nunca sai de
  `mem-words-frontend.vercel.app` — o salto para o Render acontece de borda a
  borda, fora do alcance de qualquer política de cookie de terceiros. O
  cookie do token de renovação passa a ser, para o navegador, um cookie de
  **primeira parte**.
- Nenhuma mudança de código no backend: ele continua recebendo as mesmas
  rotas, nos mesmos caminhos, e continua vendo o cabeçalho `Origin` da
  requisição original (a Vercel o repassa) — o CORS por origem específica
  configurado na mudança anterior continua válido e continua sendo
  verificado, mesmo não sendo mais o mecanismo que decide se o cookie é
  aceito.
- Desenvolvimento local não muda: frontend e backend já rodam ambos sob
  `localhost` (portas diferentes, mesmo domínio registrável), o que já não é
  cross-site para fins de cookie — o problema só existe em produção, onde os
  domínios são de fato diferentes.

## Capabilities

### Modified Capabilities

- `backend-integration/api-client`: a resolução da URL base em produção passa
  a ser um caminho relativo à própria origem, especificamente para manter o
  cookie de sessão como primeira parte — não mais qualquer URL absoluta
  configurável sem essa restrição.

## Impact

**Código afetado**

- `vercel.json` — ganha uma regra de `rewrite` para `/api/*` antes da regra
  de fallback do SPA.
- `src/config.js` — o padrão de produção passa de uma URL absoluta
  (`https://mem-words-backend.onrender.com`) para um caminho relativo
  (`/api`).

**Sem impacto**

- Nenhuma dependência nova.
- `src/api/client.js` e todo o resto do frontend continuam construindo
  requisições a partir de `API_URL`, sem saber se é caminho relativo ou URL
  absoluta — é exatamente a garantia que o requisito "URL base única e
  configurável" já existente pretendia proteger.
- O backend não muda: mesmas rotas, mesmo CORS, mesmo cookie.

**Ponto que merece decisão explícita na revisão**

Este é o caminho mais rápido dos dois considerados. A alternativa —
publicar frontend e backend sob o mesmo domínio registrável próprio (ex.:
`app.exemplo.com` e `api.exemplo.com`) — resolveria a causa na raiz, mas
depende de o usuário possuir e configurar um domínio, DNS e domínio
customizado nos dois painéis, fora do alcance desta sessão. A rota escolhida
resolve o problema observável sem essa dependência externa; se um domínio
próprio entrar em cena depois, o rewrite deixa de ser necessário e pode ser
removido.
