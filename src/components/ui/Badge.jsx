import './Badge.css'

/**
 * Selo compacto para rotular estado.
 *
 * O texto carrega a informação; a cor reforça. Um usuário que não distingue as
 * cores continua lendo o estado.
 */
export default function Badge({ variant = 'neutral', children, className = '', ...rest }) {
  return (
    <span className={`ms-badge ms-badge--${variant} ${className}`.trim()} {...rest}>
      <span className="ms-badge__dot" aria-hidden="true" />
      {children}
    </span>
  )
}
