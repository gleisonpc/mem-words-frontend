import useTranslations from '../i18n/useTranslations'
import { Card } from '../components/ui'
import './AuthScreen.css'

/** Moldura comum das telas de entrada e cadastro: um cartão centrado. */
export default function AuthScreen({ title, children, footer }) {
  const t = useTranslations()

  return (
    <main className="auth-screen">
      <header className="auth-screen__brand">
        <h1>mem-words</h1>
        <p>{t.auth.brand.tagline}</p>
      </header>

      <Card title={title} className="auth-screen__card">
        {children}
      </Card>

      {footer && <p className="auth-screen__footer">{footer}</p>}
    </main>
  )
}
