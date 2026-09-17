import { request } from './client'

/** Consulta o usuário da sessão ativa — exige token de acesso. */
export async function getMe() {
  const { user } = await request('/users/me', { auth: true })
  return user
}

/** Edita nome, e-mail e/ou senha (com `currentPassword`) da própria conta. */
export async function updateUser(id, input) {
  const { user } = await request(`/users/${id}`, { method: 'PATCH', auth: true, body: input })
  return user
}
