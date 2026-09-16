/**
 * URL base do backend.
 *
 * O valor é resolvido em tempo de build pelo Vite: o que não estiver definido
 * no momento do `vite build` não existe em tempo de execução.
 *
 * `VITE_API_URL` tem precedência quando definida no ambiente de build. Sem
 * ela, usamos um padrão embutido no código — e não um arquivo `.env` do
 * repositório, porque o build da Vercel não os aplica, o que deixaria o site
 * publicado sem backend.
 *
 * Em produção o padrão é um caminho relativo, não a URL do Render: o cookie
 * do token de renovação só se comporta como primeira parte se a requisição
 * nunca sair, aos olhos do navegador, da própria origem do frontend.
 * `vercel.json` encaminha `/api/*` para o backend por trás dos bastidores.
 */
const PRODUCTION_API_URL = '/api'
const DEVELOPMENT_API_URL = 'http://localhost:8080'

/** Remove a barra final para evitar URLs com `//` ao concatenar caminhos. */
function normalize(url) {
  return url.replace(/\/+$/, '')
}

// `trim` evita que uma variável vazia ou só com espaços vire uma URL inválida.
const configured = (import.meta.env.VITE_API_URL || '').trim()
const fallback = import.meta.env.DEV ? DEVELOPMENT_API_URL : PRODUCTION_API_URL

export const API_URL = normalize(configured || fallback)

/** De onde veio a URL deste build, exibido na tela para diagnóstico. */
export const API_URL_SOURCE = configured
  ? 'VITE_API_URL'
  : import.meta.env.DEV
    ? 'padrão de desenvolvimento'
    : 'padrão de produção'
