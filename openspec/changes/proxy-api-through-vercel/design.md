## Context

Ver `proposal.md` — Why para a causa raiz e a evidência de reprodução.
`vercel.json` hoje só tem o `rewrite` de fallback do SPA
(`/(.*) -> /index.html`), que serve `index.html` para qualquer rota que não
seja um arquivo estático — necessário para as rotas do `react-router`
funcionarem em recarga direta. `src/config.js` resolve `API_URL` para uma URL
absoluta do Render em produção.

## Goals / Non-Goals

**Goals:**

- O navegador nunca vê a requisição ao backend como indo a um domínio
  diferente do que serviu a página, em produção.
- Nenhuma mudança no backend.
- Nenhuma dependência nova.

**Non-Goals:**

- Migrar para domínio próprio compartilhado — alternativa considerada e
  documentada no `proposal.md`, fora do alcance desta mudança porque depende
  de recurso externo (domínio, DNS) que esta sessão não controla.
- Mudar o comportamento em desenvolvimento — já não é cross-site
  (`localhost` nos dois lados), o problema não existe lá.

## Decisions

### `rewrite` da Vercel, não redirecionamento

Um `rewrite` é um proxy de borda a borda: o navegador pede
`mem-words-frontend.vercel.app/api/auth/login` e nunca vê a URL do Render —
a barra de endereço, o `Origin` que o navegador atribui à requisição e o
domínio que recebe o `Set-Cookie` são todos o do frontend. Um
redirecionamento (`redirects`, HTTP 3xx) faria o navegador emitir uma segunda
requisição direta ao Render, reintroduzindo exatamente o cross-site que esta
mudança existe para eliminar.

### O `rewrite` do proxy vem antes do fallback do SPA

`vercel.json` avalia regras em ordem; a primeira que casar vence. O `rewrite`
para `/api/:path*` precisa vir antes de `/(.*) -> /index.html`, senão toda
chamada de API acabaria servindo o HTML da aplicação em vez de alcançar o
backend.

### Prefixo `/api`, removido ao encaminhar

`/api/:path*` casa qualquer coisa sob `/api/`, e `:path*` no destino carrega
só o que vem depois — `/api/auth/login` vira `.../auth/login` no Render, sem
o prefixo. O backend não precisa saber que existe um prefixo: continua
recebendo exatamente as rotas que já tinha.

### Nenhum atributo `Domain` no cookie precisa mudar

O cookie do token de renovação nunca declarou `Domain` explicitamente (ver a
mudança anterior) — na ausência desse atributo, o navegador vincula o cookie
ao host da requisição que ele *acredita* ter feito, que passa a ser
`mem-words-frontend.vercel.app`. Se o backend tivesse fixado `Domain` como o
próprio host do Render, o cookie seria rejeitado pelo navegador sob o
proxy (um host não pode fixar `Domain` para outro). Não precisou de mudança
porque a decisão de deixar `Domain` implícito já foi tomada corretamente na
mudança anterior, por outro motivo.

## Risks / Trade-offs

- **Um salto de rede a mais por requisição** (Vercel → Render, em vez de
  navegador → Render direto) → Latência adicional da borda da Vercel até o
  Render, tipicamente pequena comparada à latência do próprio Render
  (hospedagem gratuita, hiberna sem uso). Aceito: a alternativa é sessão que
  não sobrevive a um F5 na maioria dos navegadores reais.
- **Não posso verificar o comportamento do `rewrite` da Vercel a partir deste
  ambiente de desenvolvimento** (`vercel.com`/deploys da Vercel fora do
  alcance da política de rede local) → A verificação real acontece contra o
  preview deste PR, que a própria Vercel publica — mesma disciplina já usada
  nas mudanças anteriores de gerar o build e testar contra o ambiente
  publicado de verdade, não uma simulação local.
- **Se o app crescer para múltiplos serviços de backend**, um único prefixo
  `/api` pode não bastar → Não é o caso hoje; se surgir, é outra entrada de
  `rewrite`, mudança pequena e isolada.

## Migration Plan

Mudança de configuração e um valor de constante — sem mudança de contrato,
sem migração de dados. Reversão: `git revert` do commit, ou remover a regra
de `rewrite` e devolver `PRODUCTION_API_URL` à URL absoluta.

Verificação pós-deploy: repetir a reprodução do `proposal.md` (Chromium com
`--test-third-party-cookie-phaseout`) contra o preview deste PR e, depois do
merge, contra a produção.
