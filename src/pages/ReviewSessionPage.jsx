import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { getReviewQueue, recordReview } from '../api/reviews'
import ApiError from '../api/ApiError'
import { Alert, Button, Card, Spinner } from '../components/ui'
import useTranslations from '../i18n/useTranslations'
import './ReviewSessionPage.css'

/** `ApiError` de posse/existência: o backend distingue os dois casos, a tela não. */
function isUnavailable(error) {
  return error instanceof ApiError && (error.status === 403 || error.status === 404)
}

/**
 * Rótulo curto da prévia de uma nota — só o suficiente para os quatro
 * botões, não um formatador de datas genérico.
 */
function formatDueIn(dueAt, now, t) {
  const diffMinutes = (new Date(dueAt).getTime() - now.getTime()) / 60_000

  if (Math.round(diffMinutes) <= 0) {
    return t.review.dueIn.now
  }

  if (diffMinutes < 60 * 24) {
    return t.review.dueIn.minutes(Math.round(diffMinutes))
  }

  const days = Math.round(diffMinutes / (60 * 24))
  return t.review.dueIn.days(days)
}

/** Tela de sessão de revisão: percorre a fila de um baralho, um card por vez. */
export default function ReviewSessionPage() {
  const { id } = useParams()
  const t = useTranslations()

  const GRADES = [
    { grade: 'again', label: t.review.grades.again },
    { grade: 'hard', label: t.review.grades.hard },
    { grade: 'good', label: t.review.grades.good },
    { grade: 'easy', label: t.review.grades.easy },
  ]

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
          ? t.review.unavailable
          : err instanceof ApiError
            ? err.message
            : t.review.loadError,
      )
      setStatus('error')
    }
  }, [id, t])

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
        setSubmitError(err instanceof ApiError ? err.message : t.review.submitError)
      }
    },
    [index, queue, t],
  )

  if (status === 'loading') {
    return (
      <div className="review-session">
        <Link className="review-session__back" to={`/baralhos/${id}`}>
          {t.review.end}
        </Link>
        <div className="review-session__loading">
          <Spinner label={t.review.loading} />
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <Card title={t.review.unavailableTitle}>
        <Alert variant="danger">{error}</Alert>
        <p>
          <Link to={`/baralhos/${id}`}>{t.review.backToDeck}</Link>
        </p>
      </Card>
    )
  }

  if (status === 'empty' || status === 'done') {
    return (
      <Card title={status === 'done' ? t.review.doneTitle : t.review.emptyTitle}>
        <p>{status === 'done' ? t.review.doneBody : t.review.emptyBody}</p>
        <p>
          <Link to={`/baralhos/${id}`}>{t.review.backToDeck}</Link>
        </p>
      </Card>
    )
  }

  const { card, previews } = queue[index]
  const now = new Date()

  return (
    <Card
      title={t.review.progressTitle(index + 1, queue.length)}
      actions={
        <Link className="ms-button ms-button--ghost ms-button--sm" to={`/baralhos/${id}`}>
          {t.review.end}
        </Link>
      }
    >
      <div className="review-session__card" aria-live="polite">
        <p className="review-session__word">{card.word}</p>

        {revealed && (
          <>
            <p className="review-session__translation">{card.translation}</p>

            {(card.partOfSpeech || card.synonyms?.length > 0) && (
              <p className="review-session__detail">
                {card.partOfSpeech}
                {card.partOfSpeech && card.synonyms?.length > 0 ? ' · ' : ''}
                {card.synonyms?.length > 0 &&
                  t.deckDetail.cardItem.synonymsPrefix(card.synonyms.join(', '))}
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
          <Button onClick={() => setRevealed(true)}>{t.review.reveal}</Button>
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
                  {formatDueIn(preview.dueAt, now, t)}
                </span>
              </Button>
            )
          })}
        </div>
      )}
    </Card>
  )
}
