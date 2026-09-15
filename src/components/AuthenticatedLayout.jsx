import { Outlet } from 'react-router'
import useAuth from '../auth/useAuth'
import { Button } from './ui'
import './AuthenticatedLayout.css'

/**
 * Moldura das telas protegidas.
 *
 * Fica aqui, e não em cada tela, o que a área autenticada precisa oferecer de
 * qualquer lugar: quem está autenticado e o caminho para sair.
 */
export default function AuthenticatedLayout() {
  const { user, signOut } = useAuth()

  return (
    <div className="shell">
      <header className="shell__bar">
        <p className="shell__brand">mem-words</p>

        <div className="shell__session">
          <span className="shell__user" title={user?.email}>
            {user?.name ?? user?.email}
          </span>
          {/* Sem navegação aqui: encerrada a sessão, a guarda que envolve
              esta moldura redireciona — um único lugar decidindo. */}
          <Button variant="ghost" size="sm" onClick={signOut}>
            Sair
          </Button>
        </div>
      </header>

      <main className="shell__content">
        <Outlet />
      </main>
    </div>
  )
}
