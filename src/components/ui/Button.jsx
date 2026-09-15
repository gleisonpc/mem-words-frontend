import Spinner from './Spinner'
import './Button.css'

/** Sinal não cromático da variante de perigo: a cor sozinha não a distingue. */
function WarningIcon() {
  return (
    <svg
      className="ms-button__icon"
      viewBox="0 0 16 16"
      width="14"
      height="14"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M8 1.5 15 14H1L8 1.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M8 6v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="11.75" r="0.85" fill="currentColor" />
    </svg>
  )
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  children,
  className = '',
  ...rest
}) {
  // Carregando implica desabilitado: é o que impede o disparo duplo enquanto a
  // operação anterior ainda está em curso.
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      className={`ms-button ms-button--${variant} ms-button--${size} ${className}`.trim()}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <Spinner size="sm" decorative />}
      {!loading && variant === 'danger' && <WarningIcon />}
      {children}
    </button>
  )
}
