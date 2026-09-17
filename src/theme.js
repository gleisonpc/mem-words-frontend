/**
 * Escolha de tema — claro, escuro, ou do sistema (padrão).
 *
 * Guardado no navegador, não no backend: é preferência de aparelho, como a
 * do próprio sistema operacional é. Nenhum componente ramifica por tema —
 * quem decide a aparência é o CSS, lendo o atributo `data-theme` que este
 * módulo aplica; ver `src/styles/tokens.css`.
 *
 * "Do sistema" é a AUSÊNCIA da chave gravada, não um terceiro valor — nesse
 * caso o `@media (prefers-color-scheme)` do CSS já resolve sozinho, sem
 * este módulo interferir.
 */

const STORAGE_KEY = 'mem-words.theme'

/** Mesma tolerância a falha que `tokenStore.js` já aplica ao mesmo problema. */
function withStorage(operation, fallback = null) {
  try {
    return operation(window.localStorage)
  } catch {
    return fallback
  }
}

/** Tema gravado, ou `'system'` se nada foi gravado ou o valor é inválido. */
export function getTheme() {
  const stored = withStorage((storage) => storage.getItem(STORAGE_KEY))
  return stored === 'light' || stored === 'dark' ? stored : 'system'
}

/** Aplica o tema no elemento raiz, sem tocar no armazenamento. */
function applyTheme(theme) {
  if (theme === 'light' || theme === 'dark') {
    document.documentElement.setAttribute('data-theme', theme)
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
}

/** Grava a escolha (ou limpa, para "do sistema") e aplica na hora. */
export function setTheme(theme) {
  withStorage((storage) => {
    if (theme === 'light' || theme === 'dark') {
      storage.setItem(STORAGE_KEY, theme)
    } else {
      storage.removeItem(STORAGE_KEY)
    }
  })

  applyTheme(theme)
}
