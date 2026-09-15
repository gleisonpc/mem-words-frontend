/**
 * URL base do backend, lida da variável de ambiente `VITE_API_URL`.
 *
 * O valor é resolvido em tempo de build pelo Vite: o que não estiver definido
 * no momento do `vite build` não existe em tempo de execução.
 */
const DEV_FALLBACK_URL = 'http://localhost:8080'

/** Remove a barra final para evitar URLs com `//` ao concatenar caminhos. */
function normalize(url) {
  return url.replace(/\/+$/, '')
}

const configured = import.meta.env.VITE_API_URL

/** Indica se `VITE_API_URL` estava definida quando este bundle foi gerado. */
export const IS_API_URL_CONFIGURED = Boolean(configured)

/**
 * Em desenvolvimento, o backend local serve de padrão para que `npm run dev`
 * funcione sem configuração extra.
 *
 * Em produção não há fallback: apontar um site publicado para `localhost`
 * significaria pedir ao navegador do usuário que falasse com a máquina dele,
 * o que falha de um jeito que parece indisponibilidade do backend quando na
 * verdade é falta de configuração. Sem a variável, `API_URL` fica vazia e a
 * aplicação informa o problema em vez de tentar uma conexão inútil.
 */
export const API_URL = configured
  ? normalize(configured)
  : import.meta.env.DEV
    ? DEV_FALLBACK_URL
    : ''
