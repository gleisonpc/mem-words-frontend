import { Link } from 'react-router'
import HealthStatus from '../components/HealthStatus'
import useTranslations from '../i18n/useTranslations'
import './DiagnosticsPage.css'

/**
 * Diagnóstico da conexão com o backend.
 *
 * É rota pública de propósito: serve para descobrir que o backend está
 * inacessível, o que inclui o caso em que a entrada não funciona por isso.
 * Exigir sessão a tornaria inútil exatamente quando é necessária.
 */
export default function DiagnosticsPage() {
  const t = useTranslations()

  return (
    <main className="diagnostics">
      <header className="diagnostics__header">
        <h1>{t.diagnostics.title}</h1>
        <p>{t.diagnostics.subtitle}</p>
      </header>

      <HealthStatus />

      <p className="diagnostics__back">
        <Link to="/entrar">{t.diagnostics.backToLogin}</Link>
      </p>
    </main>
  )
}
