import { Navigate, Outlet, useLocation } from 'react-router'
import PageLoading from '../components/PageLoading'
import intendedDestination from './destination'
import useAuth from './useAuth'

/**
 * Inverso da guarda: mantém quem já tem sessão fora da entrada e do cadastro.
 *
 * Um formulário de login exibido a quem já está autenticado é um estado
 * ambíguo — não há o que fazer nele.
 *
 * É também o **único** lugar que navega depois de uma autenticação
 * bem-sucedida. Quando as telas navegavam por conta própria, as duas
 * navegações corriam juntas — a da tela para o destino pretendido e esta, para
 * a inicial — e a última a rodar ganhava, às vezes descartando o destino.
 */
export default function GuestOnly() {
  const { isAuthenticated, isDetermining } = useAuth()
  const location = useLocation()

  if (isDetermining) {
    return <PageLoading label="Confirmando sua sessão..." />
  }

  if (isAuthenticated) {
    return <Navigate to={intendedDestination(location.state)} replace />
  }

  return <Outlet />
}
