import { useEffect, useLayoutEffect, useRef } from 'react'
import { GOOGLE_CLIENT_ID } from '../config'
import { initializeGoogleIdentity, renderGoogleButton } from './googleIdentity'

/**
 * Botão "Entrar com o Google" — encapsula carregar o script do GIS,
 * inicializar `google.accounts.id` e renderizar o botão do próprio Google.
 * `LoginPage`/`RegisterPage` só passam `onSuccess`/`onError`; nenhuma delas
 * conhece a API do Google diretamente (ver design.md).
 *
 * Sem `GOOGLE_CLIENT_ID` configurado, não renderiza nada e não tenta
 * carregar o script — a funcionalidade correspondente simplesmente não
 * aparece, sem erro (ver spec `auth/screens`, "Configuração do Google
 * ausente").
 */
export default function GoogleSignInButton({ onSuccess, onError }) {
  const containerRef = useRef(null)

  // Guardados em ref, não como dependência do efeito: o efeito só deve
  // rodar uma vez por montagem (carregar o script e inicializar de novo a
  // cada render seria desperdício), mas o callback sempre chama a versão
  // mais recente das props.
  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)

  // Atribuição fora do corpo de render (que só deve calcular o JSX): grava
  // depois do commit, não durante o render em si.
  useLayoutEffect(() => {
    onSuccessRef.current = onSuccess
    onErrorRef.current = onError
  })

  useEffect(() => {
    if (GOOGLE_CLIENT_ID === '') {
      return undefined
    }

    let active = true

    initializeGoogleIdentity({
      clientId: GOOGLE_CLIENT_ID,
      // Só é chamado em caso de sucesso — cancelar o fluxo do Google não
      // chama nada (ver spec `auth/session`, "Google não retorna um token").
      callback: (response) => {
        if (active) {
          onSuccessRef.current(response.credential)
        }
      },
      // Cobre falhas de configuração (ex. origem não autorizada) que o GIS
      // reporta fora do callback de sucesso.
      errorCallback: () => {
        if (active) {
          onErrorRef.current('unavailable')
        }
      },
    })
      .then(() => {
        if (active && containerRef.current) {
          renderGoogleButton(containerRef.current)
        }
      })
      .catch(() => {
        if (active) {
          onErrorRef.current('unavailable')
        }
      })

    return () => {
      active = false
    }
  }, [])

  if (GOOGLE_CLIENT_ID === '') {
    return null
  }

  return <div ref={containerRef} className="google-sign-in-button" />
}
