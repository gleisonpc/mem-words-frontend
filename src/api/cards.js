import { request } from './client'

/**
 * Lista os cards de um baralho, paginados.
 *
 * `page`/`pageSize` são opcionais — omitidos, o backend aplica seus próprios
 * padrões (página 1, tamanho 50).
 */
export async function listCards(deckId, { page, pageSize } = {}) {
  const params = new URLSearchParams()

  if (page !== undefined) {
    params.set('page', page)
  }

  if (pageSize !== undefined) {
    params.set('pageSize', pageSize)
  }

  const query = params.size > 0 ? `?${params.toString()}` : ''
  return request(`/decks/${deckId}/cards${query}`, { auth: true })
}

/** Cria um card em um baralho. */
export async function createCard(deckId, input) {
  const { card } = await request(`/decks/${deckId}/cards`, {
    method: 'POST',
    auth: true,
    body: input,
  })
  return card
}

/** Detalhe de um card. */
export async function getCard(id) {
  const { card } = await request(`/cards/${id}`, { auth: true })
  return card
}

/** Edita os campos de um card. */
export async function updateCard(id, input) {
  const { card } = await request(`/cards/${id}`, { method: 'PATCH', auth: true, body: input })
  return card
}

/** Exclui um card. */
export async function deleteCard(id) {
  await request(`/cards/${id}`, { method: 'DELETE', auth: true })
}
