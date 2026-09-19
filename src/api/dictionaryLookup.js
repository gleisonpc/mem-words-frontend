/**
 * Cliente para os serviços públicos de dicionário/tradução usados na
 * sugestão automática da tela de criação de card.
 *
 * Módulo à parte de `client.js`, de propósito: aquele é específico do
 * backend do mem-words (token, renovação de sessão, URL base configurada).
 * Este não tem autenticação, tem tempo limite próprio e curto (a sugestão é
 * um extra — não deve travar a tela), e sua função principal nunca lança:
 * qualquer falha vira "sem sugestão" para essa parte, nunca um erro visível.
 * Ver design.md do change `add-card-dictionary-lookup`.
 */

const TIMEOUT_MS = 4000

/**
 * Texto comum, em português e inglês, para os idiomas cobertos pela
 * sugestão — sem diferenciar maiúsculas/acentos (ver `normalize`). Lugar
 * único para estender a cobertura depois.
 */
const LANGUAGE_CODES = {
  ingles: 'en',
  inglesa: 'en',
  english: 'en',
  en: 'en',
  portugues: 'pt',
  portuguesa: 'pt',
  portuguese: 'pt',
  pt: 'pt',
  'pt-br': 'pt',
  espanhol: 'es',
  espanhola: 'es',
  spanish: 'es',
  es: 'es',
  frances: 'fr',
  francesa: 'fr',
  french: 'fr',
  fr: 'fr',
  alemao: 'de',
  alema: 'de',
  german: 'de',
  de: 'de',
  italiano: 'it',
  italiana: 'it',
  italian: 'it',
  it: 'it',
  japones: 'ja',
  japonesa: 'ja',
  japanese: 'ja',
  ja: 'ja',
}

function normalize(text) {
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

function languageCode(text) {
  return LANGUAGE_CODES[normalize(text)] ?? null
}

/**
 * Resolve o par de idiomas de um baralho para os códigos que os serviços de
 * dicionário/tradução usam, ou `null` quando o par não é reconhecido.
 *
 * A origem precisa mapear para inglês — Wiktionary e Datamuse, os serviços
 * de definição/exemplo e sinônimos, só cobrem palavras em inglês — e o
 * destino precisa mapear para algum código da tabela, porque é o que a
 * tradução usa.
 */
export function resolveLanguagePair(sourceLanguage, targetLanguage) {
  const source = languageCode(sourceLanguage)
  const target = languageCode(targetLanguage)

  if (source !== 'en' || target === null) {
    return null
  }

  return { source, target }
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, '').trim()
}

/** Uma chamada isolada: nunca lança — falha, tempo esgotado ou corpo que não é JSON viram `null`. */
async function fetchJson(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(url, { signal: controller.signal })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

/** Frase de exemplo em inglês, da Wiktionary — a primeira encontrada entre as definições da palavra. */
async function fetchExampleSentence(word) {
  const data = await fetchJson(
    `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`,
  )

  const entries = data?.en

  if (!Array.isArray(entries)) {
    return null
  }

  for (const entry of entries) {
    for (const definition of entry.definitions ?? []) {
      const examples = definition.parsedExamples ?? definition.examples

      for (const example of examples ?? []) {
        const text = typeof example === 'string' ? example : example?.example

        if (text) {
          return stripTags(text)
        }
      }
    }
  }

  return null
}

/** Sinônimos por similaridade de sentido, do Datamuse. */
async function fetchSynonyms(word) {
  const data = await fetchJson(
    `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&max=8`,
  )

  if (!Array.isArray(data) || data.length === 0) {
    return null
  }

  const synonyms = data.map((entry) => entry.word).filter(Boolean)

  return synonyms.length > 0 ? synonyms : null
}

/** Tradução da palavra, da MyMemory — descartada quando a "tradução" devolvida é a própria palavra. */
async function fetchTranslation(word, target) {
  const data = await fetchJson(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|${target}`,
  )

  if (data?.responseStatus !== 200) {
    return null
  }

  const translation = data.responseData?.translatedText?.trim()

  if (!translation || translation.toLowerCase() === word.trim().toLowerCase()) {
    return null
  }

  return translation
}

/**
 * Busca sugestão de tradução, frase de exemplo e sinônimos para `word`.
 *
 * Nunca lança: cada serviço que falhar, expirar ou não trazer nada
 * aproveitável simplesmente não contribui — as três chamadas saem em
 * paralelo e a falta de uma não impede as outras. Devolve `null` quando o
 * par de idiomas não é reconhecido, a palavra está vazia, ou nenhum dos
 * três serviços trouxe algo.
 */
export async function fetchSuggestion({ word, sourceLanguage, targetLanguage }) {
  const trimmedWord = word.trim()
  const pair = resolveLanguagePair(sourceLanguage, targetLanguage)

  if (trimmedWord === '' || pair === null) {
    return null
  }

  const [exampleResult, synonymsResult, translationResult] = await Promise.allSettled([
    fetchExampleSentence(trimmedWord),
    fetchSynonyms(trimmedWord),
    fetchTranslation(trimmedWord, pair.target),
  ])

  const exampleSentence = exampleResult.status === 'fulfilled' ? exampleResult.value : null
  const synonyms = synonymsResult.status === 'fulfilled' ? synonymsResult.value : null
  const translation = translationResult.status === 'fulfilled' ? translationResult.value : null

  if (!exampleSentence && !synonyms && !translation) {
    return null
  }

  return {
    ...(translation && { translation }),
    ...(exampleSentence && { exampleSentence }),
    ...(synonyms && { synonyms }),
  }
}
