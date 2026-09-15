import { useId } from 'react'
import './Input.css'

/**
 * Campo de texto com rótulo, ajuda e erro.
 *
 * O rótulo é associado ao controle por `id`, e ajuda e erro entram em
 * `aria-describedby` — estar perto na tela não basta para quem usa leitor de
 * tela. `useId` garante identificadores únicos mesmo com vários campos.
 */
export default function Input({
  label,
  help,
  error,
  id,
  className = '',
  ...rest
}) {
  const generatedId = useId()
  const inputId = id || generatedId
  const helpId = `${inputId}-help`
  const errorId = `${inputId}-error`

  // Em erro, a mensagem de erro substitui a ajuda na descrição do campo, para
  // não anunciar as duas coisas ao mesmo tempo.
  const describedBy = error ? errorId : help ? helpId : undefined

  return (
    <div className={`ms-field ${className}`.trim()}>
      {label && (
        <label className="ms-field__label" htmlFor={inputId}>
          {label}
        </label>
      )}

      <input
        id={inputId}
        className={`ms-field__control${error ? ' ms-field__control--error' : ''}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />

      {error ? (
        <p className="ms-field__error" id={errorId}>
          {error}
        </p>
      ) : (
        help && (
          <p className="ms-field__help" id={helpId}>
            {help}
          </p>
        )
      )}
    </div>
  )
}
