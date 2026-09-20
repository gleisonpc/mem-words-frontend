import useTranslations from '../../i18n/useTranslations'
import './Spinner.css'

/**
 * Indicador de carregamento para operações de duração desconhecida.
 *
 * `decorative` é para quando o spinner acompanha um texto que já comunica o
 * estado (dentro de um botão "Verificando...", por exemplo): aí ele vira
 * enfeite e não deve ser anunciado duas vezes.
 */
export default function Spinner({
  size = 'md',
  label,
  decorative = false,
  className = '',
  ...rest
}) {
  const t = useTranslations()
  const resolvedLabel = label ?? t.common.loading
  const classes = `ms-spinner ms-spinner--${size} ${className}`.trim()

  if (decorative) {
    return <span className={classes} aria-hidden="true" {...rest} />
  }

  // O rótulo é texto de verdade, apenas escondido visualmente: o estado de
  // carregamento não depende de perceber a animação.
  return (
    <span className="ms-spinner-wrap" role="status" {...rest}>
      <span className={classes} aria-hidden="true" />
      <span className="ms-sr-only">{resolvedLabel}</span>
    </span>
  )
}
