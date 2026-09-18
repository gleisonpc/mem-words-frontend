import { request } from './client'

/** Fila de cards prontos para revisão de um baralho, com a prévia das 4 notas. */
export async function getReviewQueue(deckId) {
  const { queue } = await request(`/decks/${deckId}/reviews/queue`, { auth: true })
  return queue
}

/** Resumo, entre todos os baralhos, dos cards prontos para revisão agora. */
export async function getTodaySummary() {
  const { today } = await request('/reviews/today', { auth: true })
  return today
}

/** Registra uma nota (`again`/`hard`/`good`/`easy`) para um card. */
export async function recordReview(cardId, grade) {
  const { card } = await request(`/cards/${cardId}/reviews`, {
    method: 'POST',
    auth: true,
    body: { grade },
  })
  return card
}
