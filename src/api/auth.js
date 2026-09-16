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

/** Autentica por credenciais e devolve o usuário com o token de acesso. */
export function login({ email, password }) {
  return request('/auth/login', { method: 'POST', body: { email, password } })
}

/** Troca o token de acesso. Reaproveita a renovação de disparo único do cliente. */
export function refresh() {
  return renewTokens()
}

/**
 * Revoga o token de renovação apresentado pelo cookie — nenhum argumento
 * aqui, porque o frontend não manipula esse token. É idempotente no
 * backend, então chamar sem cookie algum continua respondendo sucesso.
 */
export function logout() {
  return request('/auth/logout', { method: 'POST' })
}
