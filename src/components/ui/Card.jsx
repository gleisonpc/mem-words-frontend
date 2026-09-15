import './Card.css'

/** Agrupa conteúdo relacionado sobre uma superfície delimitada. */
export default function Card({ title, actions, children, className = '', ...rest }) {
  return (
    <section className={`ms-card ${className}`.trim()} {...rest}>
      {(title || actions) && (
        <header className="ms-card__header">
          {title && <h2 className="ms-card__title">{title}</h2>}
          {actions && <div className="ms-card__actions">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  )
}
