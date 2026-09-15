import useAuth from '../auth/useAuth'
import { Card } from '../components/ui'
import './HomePage.css'

/** Tela inicial da área autenticada. */
export default function HomePage() {
  const { user } = useAuth()

  return (
    <Card title={`Olá, ${user.name}`}>
      <p className="home__intro">
        Sua conta está pronta. As telas de estudo entram aqui nas próximas
        mudanças.
      </p>

      <dl className="home__data">
        <dt>Nome</dt>
        <dd>{user.name}</dd>
        <dt>E-mail</dt>
        <dd>{user.email}</dd>
      </dl>
    </Card>
  )
}
