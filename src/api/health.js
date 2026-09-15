import { API_URL } from '../config'

/** Tempo máximo de espera pela resposta do backend, em milissegundos. */
const TIMEOUT_MS = 5000

/**
 * Consulta o endpoint `/health` do backend.
 *
 * Resolve com `{ ok, detail, misconfigured }`, onde `ok` indica se a conexão
 * foi bem sucedida, `detail` traz a mensagem retornada pelo backend ou o
 * motivo da falha, e `misconfigured` distingue uma falha de configuração de
 * uma falha de conexão.
 */
export async function checkHealth() {
  if (!API_URL) {
    return {
      ok: false,
      misconfigured: true,
      detail:
        'VITE_API_URL não estava definida quando este build foi gerado. ' +
        'Defina a variável no ambiente de build e publique novamente.',
    }
  }

  const url = `${API_URL}/health`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })

    if (!response.ok) {
      return { ok: false, detail: `HTTP ${response.status} ${response.statusText}`.trim() }
    }

    return { ok: true, detail: await describeBody(response) }
  } catch (error) {
    if (error.name === 'AbortError') {
      return { ok: false, detail: `Tempo limite de ${TIMEOUT_MS / 1000}s excedido` }
    }
    return { ok: false, detail: error.message || 'Não foi possível conectar ao backend' }
  } finally {
    clearTimeout(timeout)
  }
}

/** Resume o corpo da resposta para exibição, aceitando JSON ou texto puro. */
async function describeBody(response) {
  const body = await response.text()

  if (!body) {
    return `HTTP ${response.status}`
  }

  try {
    const parsed = JSON.parse(body)
    return typeof parsed === 'string' ? parsed : JSON.stringify(parsed)
  } catch {
    return body.trim()
  }
}
