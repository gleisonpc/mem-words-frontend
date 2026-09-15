import { Navigate, Outlet, useLocation } from 'react-router'
import PageLoading from '../components/PageLoading'
import useAuth from './useAuth'

/**
 * Guarda de rota: exibe a rota protegida, espera, ou desvia para a entrada.
 *
 * Os três estados existem por causa do segundo. Concluir "não autenticado"
 * enquanto a sessão ainda está sendo confirmada jogaria quem recarrega uma
 * rota protegida na tela de entrada por um instante, antes de devolvê-lo à
 * tela — um salto visível e uma falsa indicação de que a sessão caiu.
 */
export default function RequireAuth() {
  const { isAuthenticated, isDetermining, signedOut } = useAuth()
  const location = useLocation()

  if (isDetermining) {
    return <PageLoading label="Confirmando sua sessão..." />
  }

  if (!isAuthenticated) {
    // O destino pretendido viaja no `state` do histórico, para que a entrada
    // saiba para onde devolver a pessoa. `replace` evita que o botão voltar
    // caia de novo na rota protegida.
    //
    // Depois de uma saída pedida pelo usuário, não há destino a guardar: a
    // próxima entrada é voluntária e leva à tela inicial. Guardar aqui faria
    // a pessoa ser devolvida à tela de onde ela acabou de sair.
    return (
      <Navigate to="/entrar" replace state={signedOut ? undefined : { from: location }} />
    )
  }

  return <Outlet />
}
