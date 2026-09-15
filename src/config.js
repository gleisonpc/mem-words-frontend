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
 */
const PRODUCTION_API_URL = 'https://mem-words-backend.onrender.com'
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
