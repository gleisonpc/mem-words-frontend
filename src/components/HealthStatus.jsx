import { useCallback, useEffect, useState } from 'react'
import { checkHealth } from '../api/health'
import { API_URL, API_URL_SOURCE } from '../config'
import useTranslations from '../i18n/useTranslations'
import { Badge, Button, Card } from './ui'
import './HealthStatus.css'

const VARIANTS = {
  loading: 'neutral',
  ok: 'success',
  error: 'danger',
}

export default function HealthStatus() {
  const t = useTranslations()
  const LABELS = {
    loading: t.healthStatus.loading,
    ok: t.healthStatus.ok,
    error: t.healthStatus.error,
  }
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

  const carregando = status === 'loading'

  return (
    <Card title={t.healthStatus.title}>
      <div className="health" aria-live="polite">
        <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>

        {detail && <p className="health__detail">{detail}</p>}

        <dl className="health__meta">
          <dt>{t.healthStatus.endpoint}</dt>
          <dd>
            <code>{API_URL}/health</code>
          </dd>
          <dt>{t.healthStatus.origin}</dt>
          <dd>{API_URL_SOURCE}</dd>
        </dl>

        <Button variant="secondary" onClick={verify} loading={carregando}>
          {carregando ? t.healthStatus.verifying : t.healthStatus.verifyAgain}
        </Button>
      </div>
    </Card>
  )
}
