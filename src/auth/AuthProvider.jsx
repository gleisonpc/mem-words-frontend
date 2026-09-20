import { useCallback, useEffect, useMemo, useState } from 'react'
import ApiError from '../api/ApiError'
import * as authApi from '../api/auth'
import * as usersApi from '../api/users'
import { getTranslations } from '../i18n/useTranslations'
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
        // sozinha: só a segunda justifica guardar o destino para voltar. A
        // exclusão de conta também foi pedida pela pessoa — não há
        // `/perfil` para onde voltar depois dela.
        const requested = reason === tokenStore.LOGOUT || reason === tokenStore.ACCOUNT_DELETED
        setState({ status: ANONYMOUS, user: null, signedOut: requested })

        if (reason === tokenStore.LOGOUT) {
          setNotice(null)
        } else if (reason === tokenStore.ACCOUNT_DELETED) {
          setNotice({
            variant: 'success',
            message: getTranslations().auth.session.accountDeleted,
          })
        } else {
          setNotice({
            variant: 'warning',
            message: getTranslations().auth.session.sessionExpired,
          })
        }
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
            message: getTranslations().auth.session.confirmFailed(error.message),
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

  /**
   * Edita nome, e-mail e/ou senha da própria conta.
   *
   * Só atualiza o estado depois do `await` ter sucesso: uma recusa do
   * backend não deve alterar o usuário exposto pela sessão. Espelha o par
   * estado+depósito que `signIn` já mantém — é o que faz o cabeçalho (e
   * qualquer outro consumidor de `useAuth().user`) refletir a edição sem
   * recarregar a página.
   */
  const updateProfile = useCallback(
    async (input) => {
      const user = await usersApi.updateUser(state.user.id, input)

      tokenStore.setUser(user)
      setState((current) => ({ ...current, user }))

      return user
    },
    [state.user],
  )

  /**
   * Exclui a própria conta e encerra a sessão local.
   *
   * A ordem importa: só encerra a sessão depois que o backend confirma a
   * exclusão — uma senha incorreta deve deixar a pessoa exatamente onde
   * estava, com a sessão intacta, e não deslogada por engano.
   */
  const deleteAccount = useCallback(
    async (currentPassword) => {
      await usersApi.deleteUser(state.user.id, { currentPassword })

      tokenStore.clear(tokenStore.ACCOUNT_DELETED)

      // Mesmo raciocínio do `signOut`: a revogação segue sem ser aguardada,
      // e a falha é engolida de propósito — a conta já foi excluída no
      // backend (a cascata do schema já revogou os refresh tokens), isto
      // só limpa o cookie do navegador.
      authApi.logout().catch(() => {})
    },
    [state.user],
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
      updateProfile,
      deleteAccount,
      dismissNotice,
    }),
    [state, notice, signIn, signUp, signOut, updateProfile, deleteAccount, dismissNotice],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
