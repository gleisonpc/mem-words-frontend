import { request } from './client'

/**
 * Consulta o endpoint `/health` do backend.
 *
 * Resolve com `{ ok, detail }`, onde `ok` indica se a conexão foi bem sucedida
 * e `detail` traz a mensagem retornada pelo backend ou o motivo da falha.
 *
 * Passa pelo cliente HTTP como qualquer outra chamada, sem token: é um
 * endpoint público. O tempo limite curto é próprio desta chamada — aqui o
 * objetivo é justamente reportar rápido que o backend não está respondendo.
 */

const TIMEOUT_MS = 5000

/** Resume o corpo da resposta para exibição, aceitando JSON ou texto puro. */
function describeBody(payload) {
  if (payload === null) {
    return 'HTTP 200'
  }

  return typeof payload === 'string' ? payload : JSON.stringify(payload)
}

/** Motivo da falha: conexão perdida vem pronta; recusa do backend leva o status. */
function describeFailure(error) {
  if (error.isConnectionFailure) {
    return error.message
  }

  return `HTTP ${error.status} ${error.message}`.trim()
}

export async function checkHealth() {
  try {
    return { ok: true, detail: describeBody(await request('/health', { timeoutMs: TIMEOUT_MS })) }
  } catch (error) {
    return { ok: false, detail: describeFailure(error) }
  }
}
