import { Link } from 'react-router'
import { Card } from '../components/ui'
import './NotFoundPage.css'

/** Endereço que não corresponde a nenhuma tela. */
export default function NotFoundPage() {
  return (
    <main className="not-found">
      <Card title="Página não encontrada">
        <p>O endereço que você abriu não corresponde a nenhuma tela do mem-words.</p>
        <p>
          <Link to="/">Ir para a tela inicial</Link> ou{' '}
          <Link to="/entrar">entrar na sua conta</Link>.
        </p>
      </Card>
    </main>
  )
}
