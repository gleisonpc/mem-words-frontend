import { request } from './client'

/** Lista os baralhos do usuário autenticado. */
export async function listDecks() {
  const { decks } = await request('/decks', { auth: true })
  return decks
}

/** Cria um baralho. */
export async function createDeck(input) {
  const { deck } = await request('/decks', { method: 'POST', auth: true, body: input })
  return deck
}

/** Detalhe de um baralho, incluindo a contagem de cards. */
export async function getDeck(id) {
  const { deck } = await request(`/decks/${id}`, { auth: true })
  return deck
}

/** Edita nome e/ou par de idiomas de um baralho. */
export async function updateDeck(id, input) {
  const { deck } = await request(`/decks/${id}`, { method: 'PATCH', auth: true, body: input })
  return deck
}

/** Exclui um baralho e, em cascata, seus cards. */
export async function deleteDeck(id) {
  await request(`/decks/${id}`, { method: 'DELETE', auth: true })
}
