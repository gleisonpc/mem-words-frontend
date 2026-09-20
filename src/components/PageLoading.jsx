import useTranslations from '../i18n/useTranslations'
import { Spinner } from './ui'
import './PageLoading.css'

/** Espera de tela inteira, usada enquanto a sessão está sendo determinada. */
export default function PageLoading({ label }) {
  const t = useTranslations()

  return (
    <div className="page-loading">
      <Spinner label={label ?? t.pageLoading.defaultLabel} />
    </div>
  )
}
