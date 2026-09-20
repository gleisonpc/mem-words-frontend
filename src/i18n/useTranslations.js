import { useSyncExternalStore } from 'react'
import { getLanguage, subscribeLanguage } from './language'
import pt from './dictionaries/pt'
import en from './dictionaries/en'

const DICTIONARIES = { pt, en }

/**
 * Dicionário do idioma ativo, para código que não é componente e por isso não
 * pode chamar um hook (validação, mensagens de sessão) — lê o idioma corrente
 * a cada chamada, sem se inscrever: quem exibe o resultado já usa
 * `useTranslations` e re-renderiza sozinho quando o idioma muda.
 */
export function getTranslations() {
  return DICTIONARIES[getLanguage()]
}

/**
 * Dicionário de texto de interface correspondente ao idioma ativo.
 *
 * `useSyncExternalStore` (nativo do React, sem Contexto/Provedor) re-renderiza
 * sozinho qualquer componente que chame este hook quando `setLanguage` muda o
 * idioma ativo — o mesmo problema que um Contexto resolveria, sem introduzir
 * um provedor na árvore.
 */
export default function useTranslations() {
  const language = useSyncExternalStore(subscribeLanguage, getLanguage)
  return DICTIONARIES[language]
}
