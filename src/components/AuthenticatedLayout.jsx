import { Link, Outlet } from 'react-router'
import useAuth from '../auth/useAuth'
import useTranslations from '../i18n/useTranslations'
import { Button } from './ui'
import './AuthenticatedLayout.css'

/**
 * Moldura das telas protegidas.
 *
 * Fica aqui, e não em cada tela, o que a área autenticada precisa oferecer de
 * qualquer lugar: quem está autenticado, o caminho até o perfil, e o
 * caminho para sair.
 */
export default function AuthenticatedLayout() {
  const { user, signOut } = useAuth()
  const t = useTranslations()

  return (
    <div className="shell">
      <header className="shell__bar">
        <Link className="shell__brand" to="/">
          mem-words
        </Link>

        <div className="shell__session">
          {/* O nome/e-mail é o próprio link para o perfil — não precisa de
              um segundo elemento só para isso. */}
          <Link className="shell__user" to="/perfil" title={user?.email}>
            {user?.name ?? user?.email}
          </Link>
          {/* Sem navegação aqui: encerrada a sessão, a guarda que envolve
              esta moldura redireciona — um único lugar decidindo. */}
          <Button variant="ghost" size="sm" onClick={signOut}>
            {t.layout.signOut}
          </Button>
        </div>
      </header>

      <main className="shell__content">
        <Outlet />
      </main>
    </div>
  )
}
