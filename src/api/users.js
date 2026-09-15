import { request } from './client'

/** Consulta o usuário da sessão ativa — exige token de acesso. */
export async function getMe() {
  const { user } = await request('/users/me', { auth: true })
  return user
}
