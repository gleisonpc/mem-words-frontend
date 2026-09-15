/**
 * Falha de uma chamada ao backend, em formato único.
 *
 * Erro do backend, falha de rede, tempo limite e resposta ilegível chegam às
 * telas como a mesma coisa — assim nenhuma tela precisa descobrir a origem do
 * problema para conseguir exibi-lo.
 */

/** Códigos usados quando a falha não veio do backend. */
export const NETWORK_ERROR = 'NETWORK_ERROR'
export const TIMEOUT = 'TIMEOUT'

/** Mensagem exibida quando não há nada melhor vindo do backend. */
const FALLBACK_MESSAGE = 'Não foi possível concluir a operação.'

/**
 * O backend prefixa o nome do campo com a parte da requisição em que ele
 * estava: `body.email`, `params.id`. As telas conhecem o campo pelo nome nu.
 */
function fieldName(field) {
  return String(field).replace(/^(body|params|query)\./, '')
}

/**
 * Converte o `details` do backend — `[{ field, message }]` — no mapa que os
 * formulários consomem. Entradas sem campo ou sem mensagem são ignoradas: o
 * erro geral já cobre o que elas diriam.
 */
function toFieldErrors(details) {
  if (!Array.isArray(details)) {
    return {}
  }

  const errors = {}

  for (const detail of details) {
    if (detail && typeof detail.field === 'string' && typeof detail.message === 'string') {
      const name = fieldName(detail.field)

      // Primeira mensagem por campo: o campo só tem um lugar para exibi-la.
      if (!(name in errors)) {
        errors[name] = detail.message
      }
    }
  }

  return errors
}

export default class ApiError extends Error {
  constructor(message, { status = 0, code = NETWORK_ERROR, details, cause } = {}) {
    super(message || FALLBACK_MESSAGE, cause === undefined ? undefined : { cause })
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
    this.fieldErrors = toFieldErrors(details)
  }

  /**
   * Constrói a falha a partir de uma resposta de erro do backend, que sempre
   * traz `{ error, code, details? }`.
   *
   * `body` pode ser nulo quando a resposta não tinha corpo legível — uma
   * resposta de erro nunca é tratada como sucesso, então nesse caso a
   * mensagem vem do próprio status HTTP.
   */
  static fromResponse(response, body) {
    const message =
      body && typeof body.error === 'string'
        ? body.error
        : `Falha na requisição (HTTP ${response.status}).`

    return new ApiError(message, {
      status: response.status,
      code: (body && typeof body.code === 'string' && body.code) || `HTTP_${response.status}`,
      details: body ? body.details : undefined,
    })
  }

  /** Falha sem resposta: rede indisponível, origem bloqueada, DNS. */
  static network(cause) {
    return new ApiError('Não foi possível conectar ao backend.', {
      code: NETWORK_ERROR,
      cause,
    })
  }

  /** Falha por tempo limite, com o limite em milissegundos. */
  static timeout(timeoutMs) {
    return new ApiError(`Tempo limite de ${timeoutMs / 1000}s excedido.`, { code: TIMEOUT })
  }

  /** Verdadeiro quando o backend recusou por autenticação. */
  get isUnauthorized() {
    return this.status === 401
  }

  /** Verdadeiro quando a falha foi de conexão, e não uma recusa do backend. */
  get isConnectionFailure() {
    return this.code === NETWORK_ERROR || this.code === TIMEOUT
  }
}
