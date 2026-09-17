import { request } from './client'

/**
 * Lista os cards de um baralho, paginados.
 *
 * `page`/`pageSize` são opcionais — omitidos, o backend aplica seus próprios
 * padrões (página 1, tamanho 50). `q` busca por palavra e `status` filtra
 * pelo status calculado do card; os dois são opcionais e se combinam.
 */
export async function listCards(deckId, { page, pageSize, q, status } = {}) {
  const params = new URLSearchParams()

  if (page !== undefined) {
    params.set('page', page)
  }

  if (pageSize !== undefined) {
    params.set('pageSize', pageSize)
  }

  if (q !== undefined) {
    params.set('q', q)
  }

  if (status !== undefined) {
    params.set('status', status)
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

/** Suspende um card, tirando-o da revisão até ser reativado. */
export async function suspendCard(id) {
  const { card } = await request(`/cards/${id}/suspend`, { method: 'POST', auth: true })
  return card
}

/** Reativa um card suspenso, retomando seu agendamento de onde parou. */
export async function unsuspendCard(id) {
  const { card } = await request(`/cards/${id}/unsuspend`, { method: 'POST', auth: true })
  return card
}
