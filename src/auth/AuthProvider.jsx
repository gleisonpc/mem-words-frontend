import { useCallback, useEffect, useMemo, useState } from 'react'
import ApiError from '../api/ApiError'
import * as authApi from '../api/auth'
import * as usersApi from '../api/users'
import { ANONYMOUS, AUTHENTICATED, AccountCreatedError, AuthContext, DETERMINING } from './session'
import * as tokenStore from './tokenStore'

/**
 * Provedor da sessão da aplicação — a única fonte de verdade, para as telas,
 * sobre quem está autenticado.
 *
 * Nenhuma tela lê os tokens guardados para decidir se há sessão: elas leem
 * daqui, pelo `useAuth`.
 */

/** Estado inicial: só é "determinando" quando há uma sessão anterior a conferir. */
function initialState() {
  return tokenStore.hasSessionHint()
    ? // O usuário guardado entra como dica de exibição, para a tela não
      // piscar sem nome enquanto a confirmação corre. Ele não autentica nada:
      // o status ainda é "determinando".
      { status: DETERMINING, user: tokenStore.getStoredUser(), signedOut: false }
    : { status: ANONYMOUS, user: null, signedOut: false }
}

export function AuthProvider({ children }) {
  const [state, setState] = useState(initialState)

  /**
   * Aviso para a tela de entrada sobre algo que aconteceu fora dela — sessão
   * expirada, sessão não confirmada por falta de backend.
   */
  const [notice, setNotice] = useState(null)

  // A sessão pode morrer longe de qualquer tela, dentro de uma renovação
  // recusada. O depósito avisa, e é assim que a aplicação percebe.
  useEffect(
    () =>
      tokenStore.onSessionEnded((reason) => {
        // `signedOut` separa a saída pedida pelo usuário da sessão que caiu
        // sozinha: só a segunda justifica guardar o destino para voltar.
        setState({ status: ANONYMOUS, user: null, signedOut: reason === tokenStore.LOGOUT })
        setNotice(
          reason === tokenStore.LOGOUT
            ? null
            : { variant: 'warning', message: 'Sua sessão expirou. Entre novamente.' },
        )
      }),
    [],
  )

  // Restauração da sessão guardada. A dica não prova nada — o cookie do
  // token de renovação pode estar expirado, revogado ou pertencer a uma
  // conta já excluída — então a confirmação vem do backend. Sem token de
  // acesso em memória (a recarga sempre zera), a própria chamada a
  // `getMe()` sai sem `Authorization`, o backend responde `401`, e o
  // tratamento de `401` de `client.js` já dispara a renovação pelo cookie
  // e repete — não é preciso chamar `authApi.refresh()` explicitamente aqui.
  useEffect(() => {
    if (!tokenStore.hasSessionHint()) {
      return undefined
    }

    let active = true

    async function confirm() {
      try {
        const user = await usersApi.getMe()

        if (!active) {
          return
        }

        tokenStore.setUser(user)
        setState({ status: AUTHENTICATED, user, signedOut: false })
      } catch (error) {
        if (!active) {
          return
        }

        // Backend fora do ar não é sessão inválida: apagar a dica de sessão
        // aqui deslogaria alguém por causa de uma queda momentânea.
        // Guardamos a dica e dizemos que foi conexão, não credencial.
        if (error instanceof ApiError && error.isConnectionFailure) {
          setState({ status: ANONYMOUS, user: null, signedOut: false })
          setNotice({
            variant: 'danger',
            message: `Não foi possível confirmar sua sessão: ${error.message}`,
          })
          return
        }

        // Sessão realmente inválida: o depósito descarta e avisa, e o
        // ouvinte acima cuida do estado.
        tokenStore.clear()
      }
    }

    // oxlint-disable-next-line react/set-state-in-effect
    confirm()

    return () => {
      active = false
    }
  }, [])

  const signIn = useCallback(async ({ email, password }) => {
    const { user, accessToken } = await authApi.login({ email, password })

    tokenStore.setSession({ accessToken, user })
    setState({ status: AUTHENTICATED, user, signedOut: false })
    setNotice(null)

    return user
  }, [])

  /**
   * Cadastra e entra em seguida.
   *
   * São duas chamadas porque o backend não emite tokens no cadastro. A ordem
   * importa: se a entrada falhar, a conta já existe.
   */
  const signUp = useCallback(
    async ({ name, email, password }) => {
      await authApi.register({ name, email, password })

      try {
        return await signIn({ email, password })
      } catch (error) {
        throw new AccountCreatedError(error)
      }
    },
    [signIn],
  )

  const signOut = useCallback(() => {
    // O estado local cai primeiro, e o depósito avisa o ouvinte: sair é uma
    // intenção do usuário, e um backend inacessível não pode mantê-lo preso
    // numa sessão que ele pediu para encerrar.
    tokenStore.clear(tokenStore.LOGOUT)

    // A revogação segue sem ser aguardada, e a falha é engolida de
    // propósito: localmente a sessão já terminou, e o token expira no
    // backend de todo modo. Sem argumento — o cookie do token de renovação
    // viaja sozinho; se não houver cookie algum, o backend responde sucesso
    // do mesmo jeito.
    authApi.logout().catch(() => {})
  }, [])

  const dismissNotice = useCallback(() => setNotice(null), [])

  const value = useMemo(
    () => ({
      status: state.status,
      user: state.user,
      isAuthenticated: state.status === AUTHENTICATED,
      isDetermining: state.status === DETERMINING,
      signedOut: state.signedOut,
      notice,
      signIn,
      signUp,
      signOut,
      dismissNotice,
    }),
    [state, notice, signIn, signUp, signOut, dismissNotice],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
