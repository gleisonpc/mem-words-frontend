import { useContext } from 'react'
import { AuthContext } from './session'

/**
 * Acesso das telas à sessão.
 *
 * É o único caminho: nenhuma tela importa o depósito de tokens nem lê o
 * armazenamento do navegador.
 */
export default function useAuth() {
  const context = useContext(AuthContext)

  if (context === null) {
    throw new Error('useAuth precisa estar dentro de <AuthProvider>.')
  }

  return context
}
