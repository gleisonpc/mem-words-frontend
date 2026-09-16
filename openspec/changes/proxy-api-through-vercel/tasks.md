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

- [ ] 3.1 Publicar a mudança (PR) e aguardar o preview da Vercel.
- [ ] 3.2 Contra o preview, confirmar que `/api/health` responde o mesmo que
      o backend direto — prova de que o `rewrite` está encaminhando
      corretamente.
- [ ] 3.3 Repetir, contra o preview, a reprodução do problema original:
      Chromium com `--test-third-party-cookie-phaseout`, cadastro, e
      confirmar que o cookie do token de renovação **é** gravado desta vez
      (ao contrário do resultado antes desta mudança).
- [ ] 3.4 Com o mesmo bloqueio de terceiros ativo, recarregar a página após o
      cadastro e confirmar que a sessão é restaurada — o cenário exato que o
      usuário reportou quebrado em produção.
- [ ] 3.5 Confirmar, pela inspeção do cookie no contexto do navegador
      (`context.cookies()` ou equivalente), que o domínio do cookie agora é
      o do frontend, não o do Render.

## 4. Verificação final

- [ ] 4.1 Confirmar que nenhuma dependência foi adicionada; `package.json`
      inalterado.
- [ ] 4.2 Rodar `openspec validate --specs` e confirmar que
      `backend-integration/api-client` passa.
