import { Link } from 'react-router'
import { Card } from '../components/ui'
import useTranslations from '../i18n/useTranslations'
import './NotFoundPage.css'

/** Endereço que não corresponde a nenhuma tela. */
export default function NotFoundPage() {
  const t = useTranslations()

  return (
    <main className="not-found">
      <Card title={t.notFound.title}>
        <p>{t.notFound.body}</p>
        <p>
          <Link to="/">{t.notFound.goHome}</Link> {t.notFound.or}{' '}
          <Link to="/entrar">{t.notFound.signIn}</Link>.
        </p>
      </Card>
    </main>
  )
}
