import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { getReviewQueue, recordReview } from '../api/reviews'
import ApiError from '../api/ApiError'
import { Alert, Button, Card, Spinner } from '../components/ui'
import './ReviewSessionPage.css'

const GRADES = [
  { grade: 'again', label: 'Errei' },
  { grade: 'hard', label: 'Difícil' },
  { grade: 'good', label: 'Bom' },
  { grade: 'easy', label: 'Fácil' },
]

/** `ApiError` de posse/existência: o backend distingue os dois casos, a tela não. */
function isUnavailable(error) {
  return error instanceof ApiError && (error.status === 403 || error.status === 404)
}

/**
 * Rótulo curto da prévia de uma nota — só o suficiente para os quatro
 * botões, não um formatador de datas genérico.
 */
function formatDueIn(dueAt, now) {
  const diffMinutes = (new Date(dueAt).getTime() - now.getTime()) / 60_000

  if (Math.round(diffMinutes) <= 0) {
    return 'agora'
  }

  if (diffMinutes < 60 * 24) {
    const minutes = Math.round(diffMinutes)
    return `em ${minutes} min`
  }

  const days = Math.round(diffMinutes / (60 * 24))
  return `em ${days} dia${days === 1 ? '' : 's'}`
}

/** Tela de sessão de revisão: percorre a fila de um baralho, um card por vez. */
export default function ReviewSessionPage() {
  const { id } = useParams()

  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [queue, setQueue] = useState([])
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [submittingGrade, setSubmittingGrade] = useState(null)
  const [submitError, setSubmitError] = useState(null)

  const load = useCallback(async () => {
    setStatus('loading')

    try {
      const items = await getReviewQueue(id)
      setQueue(items)
      setIndex(0)
      setRevealed(false)
      setStatus(items.length === 0 ? 'empty' : 'ok')
    } catch (err) {
      setError(
        isUnavailable(err)
          ? 'Este baralho não está disponível.'
          : err instanceof ApiError
            ? err.message
            : 'Não foi possível carregar a fila de revisão.',
      )
      setStatus('error')
    }
  }, [id])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    load()
  }, [load])

  const handleGrade = useCallback(
    async (grade) => {
      const current = queue[index]
      setSubmittingGrade(grade)
      setSubmitError(null)

      try {
        await recordReview(current.card.id, grade)
        setSubmittingGrade(null)

        if (index + 1 < queue.length) {
          setIndex(index + 1)
          setRevealed(false)
        } else {
          setStatus('done')
        }
      } catch (err) {
        setSubmittingGrade(null)
        setSubmitError(
          err instanceof ApiError ? err.message : 'Não foi possível registrar a nota.',
        )
      }
    },
    [index, queue],
  )

  if (status === 'loading') {
    return (
      <div className="review-session__loading">
        <Spinner label="Carregando sessão de revisão..." />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <Card title="Revisão indisponível">
        <Alert variant="danger">{error}</Alert>
        <p>
          <Link to={`/baralhos/${id}`}>Voltar para o baralho</Link>
        </p>
      </Card>
    )
  }

  if (status === 'empty' || status === 'done') {
    return (
      <Card title={status === 'done' ? 'Sessão concluída' : 'Nada para revisar agora'}>
        <p>
          {status === 'done'
            ? 'Você revisou todos os cards prontos deste baralho.'
            : 'Este baralho não tem cards prontos para revisão agora.'}
        </p>
        <p>
          <Link to={`/baralhos/${id}`}>Voltar para o baralho</Link>
        </p>
      </Card>
    )
  }

  const { card, previews } = queue[index]
  const now = new Date()

  return (
    <Card title={`Revisão — ${index + 1} de ${queue.length}`}>
      <div className="review-session__card" aria-live="polite">
        <p className="review-session__word">{card.word}</p>

        {revealed && (
          <>
            <p className="review-session__translation">{card.translation}</p>

            {(card.partOfSpeech || card.synonyms?.length > 0) && (
              <p className="review-session__detail">
                {card.partOfSpeech}
                {card.partOfSpeech && card.synonyms?.length > 0 ? ' · ' : ''}
                {card.synonyms?.length > 0 && `sinônimos: ${card.synonyms.join(', ')}`}
              </p>
            )}

            {card.exampleSentence && (
              <p className="review-session__detail">
                {card.exampleSentence}
                {card.exampleTranslation && ` — ${card.exampleTranslation}`}
              </p>
            )}

            {card.personalNote && <p className="review-session__note">{card.personalNote}</p>}
          </>
        )}
      </div>

      {submitError && <Alert variant="danger">{submitError}</Alert>}

      {!revealed && (
        <div className="review-session__actions">
          <Button onClick={() => setRevealed(true)}>Revelar</Button>
        </div>
      )}

      {revealed && (
        <div className="review-session__grades">
          {GRADES.map(({ grade, label }) => {
            const preview = previews.find((p) => p.grade === grade)
            return (
              <Button
                key={grade}
                variant="secondary"
                className="review-session__grade-button"
                loading={submittingGrade === grade}
                disabled={submittingGrade !== null && submittingGrade !== grade}
                onClick={() => handleGrade(grade)}
              >
                {label}
                <span className="review-session__grade-preview">
                  {formatDueIn(preview.dueAt, now)}
                </span>
              </Button>
            )
          })}
        </div>
      )}
    </Card>
  )
}
