import './Alert.css'

/**
 * Mensagem destacada de sucesso, atenção, erro ou informação.
 *
 * Um alerta que aparece em resposta a uma ação precisa ser anunciado sem que o
 * usuário tenha de encontrá-lo: `role="alert"` interrompe para erros,
 * `role="status"` aguarda uma pausa para o resto.
 */
export default function Alert({
  variant = 'info',
  title,
  children,
  className = '',
  ...rest
}) {
  const isUrgent = variant === 'danger'

  return (
    <div
      className={`ms-alert ms-alert--${variant} ${className}`.trim()}
      role={isUrgent ? 'alert' : 'status'}
      aria-live={isUrgent ? 'assertive' : 'polite'}
      {...rest}
    >
      {title && <p className="ms-alert__title">{title}</p>}
      <div className="ms-alert__body">{children}</div>
    </div>
  )
}
