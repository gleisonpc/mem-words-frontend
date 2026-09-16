import Button from './Button'
import './Pagination.css'

/**
 * Navegação entre páginas de uma listagem.
 *
 * Só anterior/próxima, sem lista de números de página: o volume esperado
 * nas listas do app não justifica a complexidade extra.
 */
export default function Pagination({ page, pageSize, total, onChange, className = '' }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  return (
    <nav className={`ms-pagination ${className}`.trim()} aria-label="Paginação">
      <Button
        variant="secondary"
        size="sm"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Anterior
      </Button>

      <span className="ms-pagination__status" aria-live="polite">
        Página {page} de {pageCount}
      </span>

      <Button
        variant="secondary"
        size="sm"
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
      >
        Próxima
      </Button>
    </nav>
  )
}
