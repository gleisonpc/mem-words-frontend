import { API_URL } from '../config'
import * as tokenStore from '../auth/tokenStore'
import ApiError from './ApiError'

/**
 * Cliente HTTP do backend — a única porta de saída da aplicação.
 *
 * Tempo limite, formato de erro, envio do token e renovação da sessão são
 * decididos aqui, uma vez, e não repetidos por tela.
 */

/**
 * Limite padrão, folgado de propósito: o backend hospedado hiberna quando
 * fica sem uso, e a primeira chamada depois disso pode levar vários segundos.
 * Um falso "fora do ar" na entrada custa mais que a espera.
 */
const DEFAULT_TIMEOUT_MS = 15000

/** Mensagem de sessão perdida, usada quando a renovação é recusada. */
const SESSION_EXPIRED_MESSAGE = 'Sua sessão expirou. Entre novamente.'

/**
 * Lê o corpo da resposta.
 *
 * Devolve `null` quando não há corpo — o `204` do encerramento de sessão é
 * sucesso sem dados, não falha de leitura. Corpo que não é JSON volta como
 * texto, que é o que a tela de diagnóstico exibe.
 */
async function readBody(response) {
  if (response.status === 204) {
    return null
  }

  const text = await response.text()

  if (text === '') {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return text.trim()
  }
}

/**
 * Uma tentativa de requisição: monta a URL, envia, e devolve o corpo já
 * parseado ou lança `ApiError`.
 *
 * O token é lido no momento do envio, e não capturado antes: é isso que faz a
 * repetição depois de uma renovação usar o token novo.
 */
async function attempt(path, { method, body, auth, timeoutMs }) {
  const headers = { Accept: 'application/json' }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (auth) {
    const accessToken = tokenStore.getAccessToken()

    if (accessToken !== null) {
      headers.Authorization = `Bearer ${accessToken}`
    }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  let response
  let payload

  try {
    // O token vai no cabeçalho; a URL nunca o carrega, porque URL vaza para
    // histórico, referenciador e log de servidor.
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      signal: controller.signal,
      ...(body !== undefined && { body: JSON.stringify(body) }),
    })

    // A leitura fica dentro do tempo limite: uma resposta que começa e não
    // termina prenderia a tela em carregamento do mesmo jeito.
    payload = await readBody(response)
  } catch (error) {
    if (error.name === 'AbortError') {
      throw ApiError.timeout(timeoutMs)
    }

    // Rede indisponível, DNS, origem bloqueada por CORS: o navegador não
    // distingue os casos para o script, e a tela não precisa distinguir.
    throw ApiError.network(error)
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) {
    // Só um objeto serve como corpo de erro do backend. Texto solto pode ser
    // a página de erro de um intermediário, que não se exibe ao usuário.
    throw ApiError.fromResponse(
      response,
      typeof payload === 'object' && payload !== null ? payload : null,
    )
  }

  return payload
}

function sessionExpired(cause) {
  return new ApiError(SESSION_EXPIRED_MESSAGE, {
    status: 401,
    code: 'SESSION_EXPIRED',
    cause,
  })
}

/**
 * Renovação em curso, guardada como **promessa** e não como sinalizador.
 *
 * O refresh token do backend é de uso único, e reapresentar um token já gasto
 * é lido como vazamento: ele revoga todas as sessões do usuário. Guardar a
 * promessa faz com que quem chegar durante uma renovação aguarde a mesma e
 * receba o mesmo par de tokens. Um sinalizador booleano evitaria a segunda
 * chamada, mas deixaria a segunda requisição sem saber quando prosseguir —
 * que é justamente o caso de duas requisições expirando juntas.
 */
let renewal = null

async function performRenewal() {
  const refreshToken = tokenStore.getRefreshToken()

  if (refreshToken === null) {
    tokenStore.clear()
    throw sessionExpired()
  }

  let tokens

  try {
    tokens = await attempt('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      auth: false,
      timeoutMs: DEFAULT_TIMEOUT_MS,
    })
  } catch (error) {
    // Backend inacessível não é sessão inválida: apagar os tokens aqui
    // deslogaria a pessoa por causa de uma queda de rede momentânea.
    if (error instanceof ApiError && error.isConnectionFailure) {
      throw error
    }

    tokenStore.clear()
    throw sessionExpired(error)
  }

  tokenStore.setTokens(tokens)
  return tokens
}

/**
 * Troca o par de tokens por um novo, garantindo uma única chamada em curso.
 *
 * Exportada porque o módulo de autenticação a reaproveita — há uma só
 * implementação de renovação na aplicação.
 */
export function renewTokens() {
  if (renewal === null) {
    renewal = performRenewal().finally(() => {
      renewal = null
    })
  }

  return renewal
}

/**
 * Executa uma requisição ao backend.
 *
 * Com `auth`, uma recusa por autenticação dispara uma renovação e **uma**
 * repetição: a repetição é feita fora do `catch`, então uma segunda recusa
 * sobe para quem chamou em vez de iniciar outra renovação. Sem esse limite,
 * credenciais erradas — que também respondem `401` — entrariam em laço.
 */
export async function request(path, { method = 'GET', body, auth = false, timeoutMs } = {}) {
  const options = { method, body, auth, timeoutMs: timeoutMs ?? DEFAULT_TIMEOUT_MS }

  if (!auth) {
    return attempt(path, options)
  }

  try {
    return await attempt(path, options)
  } catch (error) {
    if (!(error instanceof ApiError) || !error.isUnauthorized) {
      throw error
    }

    await renewTokens()
    return attempt(path, options)
  }
}
