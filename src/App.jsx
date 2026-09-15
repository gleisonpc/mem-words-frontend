import { BrowserRouter } from 'react-router'
import { AuthProvider } from './auth/AuthProvider'
import AppRoutes from './routes'

/**
 * Raiz da aplicação.
 *
 * O provedor de sessão fica **acima** do roteador: a guarda de rota precisa
 * do estado da sessão para decidir, e a sessão precisa sobreviver à troca de
 * telas sem ser determinada outra vez a cada navegação.
 */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
