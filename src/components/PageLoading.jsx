import { Spinner } from './ui'
import './PageLoading.css'

/** Espera de tela inteira, usada enquanto a sessão está sendo determinada. */
export default function PageLoading({ label = 'Carregando...' }) {
  return (
    <div className="page-loading">
      <Spinner label={label} />
    </div>
  )
}
