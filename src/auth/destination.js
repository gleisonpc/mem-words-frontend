/** Rota inicial da área autenticada. */
export const HOME = '/'

/**
 * Destino pretendido guardado pela guarda de rota no `state` do histórico.
 *
 * Caminho, busca e fragmento são recompostos: quem tentou abrir um endereço
 * com parâmetros quer voltar àquele endereço, e não a uma versão dele sem os
 * parâmetros. Sem destino guardado, o caminho é a tela inicial.
 */
export default function intendedDestination(state) {
  const from = state?.from

  if (!from?.pathname) {
    return HOME
  }

  return `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
}
