import { Link } from 'react-router'
import HealthStatus from '../components/HealthStatus'
import './DiagnosticsPage.css'

/**
 * Diagnóstico da conexão com o backend.
 *
 * É rota pública de propósito: serve para descobrir que o backend está
 * inacessível, o que inclui o caso em que a entrada não funciona por isso.
 * Exigir sessão a tornaria inútil exatamente quando é necessária.
 */
export default function DiagnosticsPage() {
  return (
    <main className="diagnostics">
      <header className="diagnostics__header">
        <h1>Diagnóstico</h1>
        <p>Conexão entre este frontend e o backend do mem-words.</p>
      </header>

      <HealthStatus />

      <p className="diagnostics__back">
        <Link to="/entrar">Voltar para a entrada</Link>
      </p>
    </main>
  )
}
