import { renewTokens, request } from './client'

/**
 * Operações de autenticação do backend.
 *
 * Todas são endpoints públicos: nenhuma delas envia o token de acesso.
 */

/**
 * Cria a conta.
 *
 * Responde com o usuário criado e **nada mais** — o backend não emite tokens
 * no cadastro. Quem quiser deixar a pessoa autenticada em seguida precisa
 * chamar `login` com as mesmas credenciais.
 */
export async function register({ name, email, password }) {
  const { user } = await request('/auth/register', {
    method: 'POST',
    body: { name, email, password },
  })

  return user
}

/** Autentica por credenciais e devolve o usuário com o par de tokens. */
export function login({ email, password }) {
  return request('/auth/login', { method: 'POST', body: { email, password } })
}

/** Troca o par de tokens. Reaproveita a renovação de disparo único do cliente. */
export function refresh() {
  return renewTokens()
}

/**
 * Revoga o token de renovação. É idempotente no backend, então reenviar um
 * token já revogado continua respondendo sucesso.
 */
export function logout(refreshToken) {
  return request('/auth/logout', { method: 'POST', body: { refreshToken } })
}
