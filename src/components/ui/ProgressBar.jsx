import './ProgressBar.css'

/**
 * Barra de progresso para operações de duração determinada.
 *
 * O valor é limitado ao intervalo: um valor fora dos limites vira uma barra
 * cheia ou vazia, nunca uma barra que transborda o container.
 */
export default function ProgressBar({
  value = 0,
  min = 0,
  max = 100,
  label,
  showValue = false,
  className = '',
  ...rest
}) {
  const span = max - min
  const clamped = Math.min(Math.max(value, min), max)
  const percent = span > 0 ? ((clamped - min) / span) * 100 : 0

  return (
    <div className={`ms-progress ${className}`.trim()} {...rest}>
      {(label || showValue) && (
        <div className="ms-progress__header">
          {label && <span className="ms-progress__label">{label}</span>}
          {showValue && <span className="ms-progress__value">{Math.round(percent)}%</span>}
        </div>
      )}
      <div
        className="ms-progress__track"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={label || undefined}
      >
        <div className="ms-progress__fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
