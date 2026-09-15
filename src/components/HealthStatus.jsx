import { useCallback, useEffect, useState } from 'react'
import { checkHealth } from '../api/health'
import { API_URL, API_URL_SOURCE } from '../config'

const LABELS = {
  loading: 'Verificando conexão...',
  ok: 'ok',
  error: 'falha na conexão',
}

export default function HealthStatus() {
  const [status, setStatus] = useState('loading')
  const [detail, setDetail] = useState('')

  // Consulta o backend e publica o resultado.
  const run = useCallback(async () => {
    const result = await checkHealth()
    setStatus(result.ok ? 'ok' : 'error')
    setDetail(result.detail)
  }, [])

  // O efeito sincroniza a tela com um sistema externo (o backend), que é
  // exatamente o caso de uso de `useEffect`: a primeira verificação precisa
  // acontecer na montagem, sem interação do usuário.
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    run()
  }, [run])

  const verify = useCallback(() => {
    setStatus('loading')
    setDetail('')
    run()
  }, [run])

  return (
    <section className="health" aria-live="polite">
      <h2>Status do backend</h2>

      <p className={`health-badge health-badge--${status}`}>
        <span className="health-dot" aria-hidden="true" />
        {LABELS[status]}
      </p>

      {detail && <p className="health-detail">{detail}</p>}

      <dl className="health-meta">
        <dt>Endpoint</dt>
        <dd>
          <code>{API_URL}/health</code>
        </dd>
        <dt>Origem</dt>
        <dd>{API_URL_SOURCE}</dd>
      </dl>

      <button type="button" onClick={verify} disabled={status === 'loading'}>
        {status === 'loading' ? 'Verificando...' : 'Verificar novamente'}
      </button>
    </section>
  )
}
