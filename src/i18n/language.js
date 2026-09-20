/**
 * Escolha de idioma da interface — português (padrão) ou inglês.
 *
 * Guardado no navegador, não no backend: é preferência de aparelho, como a
 * escolha de tema (`src/theme.js`) já é. Diferente do tema, porém, o valor
 * ativo decide *qual texto* cada componente renderiza — trocar o idioma
 * precisa re-renderizar quem exibe texto, então este módulo notifica
 * inscritos na troca, no mesmo formato de `tokenStore.onSessionEnded`
 * (`Set` de listeners, devolve a função de cancelamento); ver
 * `useTranslations.js`.
 */

const STORAGE_KEY = 'mem-words.language'

/** Mesma tolerância a falha que `theme.js`/`tokenStore.js` já aplicam ao mesmo problema. */
function withStorage(operation, fallback = null) {
  try {
    return operation(window.localStorage)
  } catch {
    return fallback
  }
}

const listeners = new Set()

/** Idioma gravado, ou `'pt'` (padrão) se nada foi gravado ou o valor é inválido. */
export function getLanguage() {
  const stored = withStorage((storage) => storage.getItem(STORAGE_KEY))
  return stored === 'en' ? 'en' : 'pt'
}

/** Locale de `Intl` correspondente ao idioma, para formatação de data. */
export function localeForLanguage(language) {
  return language === 'en' ? 'en-US' : 'pt-BR'
}

/** Aplica o idioma no elemento raiz, sem tocar no armazenamento nem nos inscritos. */
function applyLanguage(language) {
  document.documentElement.lang = localeForLanguage(language)
}

/** Grava a escolha, aplica na hora e avisa quem está inscrito. */
export function setLanguage(language) {
  const normalized = language === 'en' ? 'en' : 'pt'

  withStorage((storage) => storage.setItem(STORAGE_KEY, normalized))
  applyLanguage(normalized)

  for (const listener of listeners) {
    listener(normalized)
  }
}

/** Registra interesse na troca de idioma e devolve a função que cancela a inscrição. */
export function subscribeLanguage(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
