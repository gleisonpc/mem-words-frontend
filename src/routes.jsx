import { Route, Routes } from 'react-router'
import GuestOnly from './auth/GuestOnly'
import RequireAuth from './auth/RequireAuth'
import AuthenticatedLayout from './components/AuthenticatedLayout'
import Gallery from './components/Gallery'
import DeckDetailPage from './pages/DeckDetailPage'
import DiagnosticsPage from './pages/DiagnosticsPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
import ReviewSessionPage from './pages/ReviewSessionPage'

/**
 * Mapa de rotas da aplicação.
 *
 * A fronteira de acesso é estrutural, e não uma checagem repetida dentro de
 * cada tela: as rotas protegidas ficam sob `RequireAuth`, as de autenticação
 * sob `GuestOnly`, e o resto é público. Uma tela nova entra no grupo certo e
 * herda o comportamento.
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/entrar" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<AuthenticatedLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/baralhos/:id" element={<DeckDetailPage />} />
          <Route path="/baralhos/:id/revisar" element={<ReviewSessionPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Públicas: o diagnóstico porque é a ferramenta para descobrir que o
          backend caiu, e a galeria porque é referência de design, não dado
          de usuário. */}
      <Route path="/diagnostico" element={<DiagnosticsPage />} />
      <Route path="/galeria" element={<Gallery />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
