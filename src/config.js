/**
 * URL base do backend, lida da variável de ambiente `VITE_API_URL`.
 *
 * O valor é resolvido em tempo de build pelo Vite. Caso a variável não esteja
 * definida, caímos no backend local para que `npm run dev` funcione sem
 * configuração extra.
 */
const DEFAULT_API_URL = 'http://localhost:8080'

/** Remove a barra final para evitar URLs com `//` ao concatenar caminhos. */
function normalize(url) {
  return url.replace(/\/+$/, '')
}

export const API_URL = normalize(import.meta.env.VITE_API_URL || DEFAULT_API_URL)

/** Indica se a URL veio do ambiente ou se estamos usando o fallback. */
export const IS_API_URL_FROM_ENV = Boolean(import.meta.env.VITE_API_URL)
