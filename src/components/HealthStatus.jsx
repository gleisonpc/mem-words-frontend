import { useCallback, useEffect, useState } from 'react'
import { checkHealth } from '../api/health'
import { API_URL, IS_API_URL_CONFIGURED } from '../config'

const LABELS = {
  loading: 'Verificando conexão...',
  ok: 'ok',
  error: 'falha na conexão',
  misconfigured: 'não configurado',
}

export default function HealthStatus() {
  const [status, setStatus] = useState('loading')
  const [detail, setDetail] = useState('')

  // Consulta o backend e publica o resultado.
  const run = useCallback(async () => {
    const result = await checkHealth()
    if (result.ok) {
      setStatus('ok')
    } else {
      setStatus(result.misconfigured ? 'misconfigured' : 'error')
    }
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
          {API_URL ? <code>{API_URL}/health</code> : <em>indisponível</em>}
        </dd>
        <dt>VITE_API_URL</dt>
        <dd>{IS_API_URL_CONFIGURED ? 'definida' : 'não definida neste build'}</dd>
      </dl>

      <button type="button" onClick={verify} disabled={status === 'loading'}>
        {status === 'loading' ? 'Verificando...' : 'Verificar novamente'}
      </button>
    </section>
  )
}
