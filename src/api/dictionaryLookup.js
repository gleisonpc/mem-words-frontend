import { request } from './client'

/**
 * Busca sugestão de tradução, frase de exemplo e sinônimos para uma
 * palavra, através do backend (`GET /dictionary/suggest`) — o backend é
 * quem fala com os serviços externos de dicionário/tradução (Wiktionary,
 * Datamuse, MyMemory), nunca o navegador. `client.js` é a única porta de
 * saída da aplicação; este módulo não faz `fetch` para fora do backend (ver
 * design.md do change `add-card-dictionary-lookup`, correção "sugestão
 * passa a vir do backend").
 *
 * Nunca lança: uma falha nesta chamada (rede, tempo limite, backend fora do
 * ar) vira "sem sugestão" para a tela, do mesmo jeito que uma falha de
 * qualquer serviço externo já virava antes — a sugestão é um extra, nunca
 * um bloqueio. O backend decide sozinho se o par de idiomas é reconhecido;
 * quando não é, ele responde `suggestion: null` sem ter chamado serviço
 * externo nenhum.
 */
export async function fetchSuggestion({ word, sourceLanguage, targetLanguage }) {
  const params = new URLSearchParams({ word, sourceLanguage, targetLanguage })

  try {
    const { suggestion } = await request(`/dictionary/suggest?${params.toString()}`, { auth: true })
    return suggestion
  } catch {
    return null
  }
}
