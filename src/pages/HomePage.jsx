import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { createDeck, listDecks } from '../api/decks'
import { getTodaySummary } from '../api/reviews'
import ApiError from '../api/ApiError'
import useAuth from '../auth/useAuth'
import useAuthForm from '../auth/useAuthForm'
import { collect } from '../auth/validation'
import { Alert, Badge, Button, Card, Input, Spinner } from '../components/ui'
import useTranslations, { getTranslations } from '../i18n/useTranslations'
import './HomePage.css'

const NAME_MAX = 120
// Heurística fixa, não uma medição: só para dar uma ideia do tamanho da
// sessão antes de começar. Ver design.md.
const SECONDS_PER_CARD = 20

function validateName(value) {
  const name = value.trim()
  const { validation } = getTranslations().home

  if (name === '') {
    return validation.nameRequired
  }

  if (name.length > NAME_MAX) {
    return validation.nameMax(NAME_MAX)
  }

  return null
}

function validateLanguage(value) {
  const language = value.trim()
  return language === '' ? getTranslations().home.validation.languageRequired : null
}

function validate(values) {
  return collect({
    name: validateName(values.name),
    sourceLanguage: validateLanguage(values.sourceLanguage),
    targetLanguage: validateLanguage(values.targetLanguage),
  })
}

function describeError(error) {
  const message =
    error instanceof ApiError ? error.message : getTranslations().home.createDeckForm.genericError
  return { variant: 'danger', message }
}

/** Formulário de criação de um baralho novo, revelado sob demanda. */
function CreateDeckForm({ onCreated, onCancel }) {
  const t = useTranslations()

  const submit = useCallback(
    async (values) => {
      const deck = await createDeck(values)
      onCreated(deck)
    },
    [onCreated],
  )

  const { values, change, fieldErrors, generalError, submitting, handleSubmit } = useAuthForm({
    initialValues: { name: '', sourceLanguage: '', targetLanguage: '' },
    validate,
    submit,
    describeError,
  })

  return (
    <Card title={t.home.createDeckForm.title}>
      {generalError && <Alert variant={generalError.variant}>{generalError.message}</Alert>}

      <form className="deck-form" onSubmit={handleSubmit} noValidate>
        <Input
          label={t.home.createDeckForm.nameLabel}
          name="name"
          autoComplete="off"
          value={values.name}
          onChange={change('name')}
          error={fieldErrors.name}
          disabled={submitting}
        />

        <Input
          label={t.home.createDeckForm.sourceLanguageLabel}
          name="sourceLanguage"
          placeholder={t.home.createDeckForm.sourceLanguagePlaceholder}
          autoComplete="off"
          value={values.sourceLanguage}
          onChange={change('sourceLanguage')}
          error={fieldErrors.sourceLanguage}
          disabled={submitting}
        />

        <Input
          label={t.home.createDeckForm.targetLanguageLabel}
          name="targetLanguage"
          placeholder={t.home.createDeckForm.targetLanguagePlaceholder}
          autoComplete="off"
          value={values.targetLanguage}
          onChange={change('targetLanguage')}
          error={fieldErrors.targetLanguage}
          disabled={submitting}
        />

        <div className="deck-form__actions">
          <Button variant="ghost" type="button" disabled={submitting} onClick={onCancel}>
            {t.common.cancel}
          </Button>
          <Button type="submit" loading={submitting}>
            {submitting ? t.home.createDeckForm.creating : t.home.createDeckForm.submit}
          </Button>
        </div>
      </form>
    </Card>
  )
}

/** Selo de quantos cards estão prontos para revisão agora, ou "em dia". */
function DueBadge({ dueCount }) {
  const t = useTranslations()

  if (dueCount > 0) {
    return <Badge variant="warning">{t.home.dueBadge.dueToday(dueCount)}</Badge>
  }

  return <Badge variant="success">{t.home.dueBadge.upToDate}</Badge>
}

/** "Bom dia"/"Boa tarde"/"Boa noite" conforme o horário local. */
function greeting(now) {
  const hour = now.getHours()
  const { home } = getTranslations()

  if (hour < 12) {
    return home.greetingMorning
  }

  if (hour < 18) {
    return home.greetingAfternoon
  }

  return home.greetingEvening
}

function firstName(name) {
  return name.trim().split(/\s+/)[0] || name
}

/** Minutos estimados para revisar `dueCount` cards, arredondado para cima. */
function estimateMinutes(dueCount) {
  if (dueCount <= 0) {
    return 0
  }

  return Math.max(1, Math.round((dueCount * SECONDS_PER_CARD) / 60))
}

/**
 * Barra de composição do que está pronto agora — três segmentos
 * proporcionais, sem representar "andamento" nenhum (o backend não guarda
 * histórico de revisões). Local à tela: um único consumidor até agora não
 * justifica generalizar `ProgressBar` para múltiplos segmentos.
 */
function DueComposition({ newCount, learningCount, reviewCount }) {
  const total = newCount + learningCount + reviewCount

  if (total <= 0) {
    return null
  }

  const segments = [
    { count: newCount, className: 'home__due-segment--new' },
    { count: learningCount, className: 'home__due-segment--learning' },
    { count: reviewCount, className: 'home__due-segment--review' },
  ]

  return (
    <div className="home__due-bar">
      {segments.map(
        (segment) =>
          segment.count > 0 && (
            <span
              key={segment.className}
              className={`home__due-segment ${segment.className}`}
              style={{ width: `${(segment.count / total) * 100}%` }}
            />
          ),
      )}
    </div>
  )
}

/**
 * Cartão "Revisão de hoje": resumo agregado entre baralhos, com as ações de
 * começar a revisar e adicionar uma palavra.
 */
function TodaySummaryCard({ status, today, nextReviewDeck, decks, onAddWord }) {
  const t = useTranslations()

  if (status === 'loading') {
    return (
      <Card title={t.home.todaySummary.title}>
        <div className="home__today-loading">
          <Spinner label={t.home.todaySummary.loading} />
        </div>
      </Card>
    )
  }

  if (status === 'error') {
    return (
      <Card title={t.home.todaySummary.title}>
        <Alert variant="danger">{t.home.todaySummary.loadError}</Alert>
      </Card>
    )
  }

  const dueCount = today.dueCount ?? 0

  return (
    <Card title={t.home.todaySummary.title}>
      {dueCount === 0 ? (
        <p className="home__today-empty">{t.home.todaySummary.empty}</p>
      ) : (
        <>
          <div className="home__today-header">
            <span className="home__today-count">{t.home.todaySummary.cardsCount(dueCount)}</span>
            <span className="home__today-estimate">
              {t.home.todaySummary.estimateMinutes(estimateMinutes(dueCount))}
            </span>
          </div>

          <div className="home__today-badges">
            {today.newCount > 0 && (
              <Badge variant="info">{t.home.todaySummary.newBadge(today.newCount)}</Badge>
            )}
            {today.learningCount > 0 && (
              <Badge variant="warning">
                {t.home.todaySummary.learningBadge(today.learningCount)}
              </Badge>
            )}
            {today.reviewCount > 0 && (
              <Badge variant="neutral">{t.home.todaySummary.reviewBadge(today.reviewCount)}</Badge>
            )}
          </div>

          <DueComposition
            newCount={today.newCount ?? 0}
            learningCount={today.learningCount ?? 0}
            reviewCount={today.reviewCount ?? 0}
          />
        </>
      )}

      <div className="home__today-actions">
        {nextReviewDeck ? (
          <Link
            className="ms-button ms-button--primary ms-button--md"
            to={`/baralhos/${nextReviewDeck.id}/revisar`}
          >
            {t.home.todaySummary.startReview}
          </Link>
        ) : (
          <Button disabled>{t.home.todaySummary.startReview}</Button>
        )}

        {decks.length > 0 && (
          <Button variant="secondary" onClick={onAddWord}>
            {t.home.todaySummary.addWord}
          </Button>
        )}
      </div>
    </Card>
  )
}

/** Seletor de baralho para "Adicionar palavra", quando há mais de um. */
function DeckPicker({ decks, onClose }) {
  const t = useTranslations()

  return (
    <div className="home__deck-picker">
      <p className="home__deck-picker-title">{t.home.deckPicker.title}</p>
      <ul className="home__deck-picker-list">
        {decks.map((deck) => (
          <li key={deck.id}>
            <Link to={`/baralhos/${deck.id}`}>{deck.name}</Link>
          </li>
        ))}
      </ul>
      <Button variant="ghost" size="sm" onClick={onClose}>
        {t.common.cancel}
      </Button>
    </div>
  )
}

/**
 * Um baralho na lista: nome, idiomas, total de cards e selo de prontos —
 * tudo que o backend já manda pronto em `GET /decks`, sem chamada extra por
 * baralho. A maturidade de cada baralho fica só na tela de detalhe.
 */
function DeckRow({ deck }) {
  const t = useTranslations()
  const cardCount = deck.cardCount ?? 0
  const dueCount = deck.dueCount ?? 0

  return (
    <li className="home__deck-row">
      <Link className="home__deck-row-main" to={`/baralhos/${deck.id}`}>
        <span className="home__deck-name">{deck.name}</span>
        <p className="home__deck-meta">
          {t.home.deckList.cardCount(cardCount)} · {deck.sourceLanguage} → {deck.targetLanguage}
        </p>
      </Link>

      <div className="home__deck-row-actions">
        <DueBadge dueCount={dueCount} />
        {dueCount > 0 ? (
          <Link
            className="ms-button ms-button--ghost ms-button--sm"
            to={`/baralhos/${deck.id}/revisar`}
          >
            {t.home.deckList.review}
          </Link>
        ) : (
          <Button variant="ghost" size="sm" disabled>
            {t.home.deckList.review}
          </Button>
        )}
      </div>
    </li>
  )
}

/** Tela inicial da área autenticada: painel do dia e os baralhos do usuário. */
export default function HomePage() {
  const { user } = useAuth()
  const t = useTranslations()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')
  const [decks, setDecks] = useState([])
  const [error, setError] = useState(null)
  const [todayStatus, setTodayStatus] = useState('loading')
  const [today, setToday] = useState(null)
  const [creating, setCreating] = useState(false)
  const [addingWord, setAddingWord] = useState(false)
  // Muda a cada baralho criado, para remontar `CreateDeckForm` com campos
  // vazios (ver a mesma técnica em `DeckDetailPage`).
  const [createFormKey, setCreateFormKey] = useState(0)

  const load = useCallback(async () => {
    setStatus('loading')

    try {
      setDecks(await listDecks())
      setStatus('ok')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.home.deckList.loadError)
      setStatus('error')
    }
  }, [t])

  const loadToday = useCallback(async () => {
    setTodayStatus('loading')

    try {
      setToday(await getTodaySummary())
      setTodayStatus('ok')
    } catch {
      setTodayStatus('error')
    }
  }, [])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    load()
    // oxlint-disable-next-line react/set-state-in-effect
    loadToday()
  }, [load, loadToday])

  // Baralho recém-criado não pode ter card algum — as três contagens
  // entram zeradas sem uma nova ida ao backend só para confirmar isso.
  const handleCreated = useCallback((deck) => {
    setDecks((current) => [...current, { ...deck, cardCount: 0, dueCount: 0, matureCount: 0 }])
    setCreateFormKey((current) => current + 1)
    setCreating(false)
  }, [])

  // Ordem de `GET /decks` (mais antigo primeiro) — o primeiro com algo
  // pronto é para onde "Começar revisão" manda. Ver design.md.
  const nextReviewDeck = decks.find((deck) => (deck.dueCount ?? 0) > 0) ?? null

  // Com um único baralho não há ambiguidade: vai direto para lá. Com mais
  // de um, revela o seletor abaixo do cartão de revisão de hoje.
  const handleAddWord = useCallback(() => {
    if (decks.length === 1) {
      navigate(`/baralhos/${decks[0].id}`)
      return
    }

    setAddingWord(true)
  }, [decks, navigate])

  return (
    <div className="home">
      <div className="home__greeting">
        <h1 className="home__title">
          {greeting(new Date())}
          {user ? `, ${firstName(user.name)}` : ''}
        </h1>
        {user && user.currentStreak > 0 && (
          <Badge variant="success">{t.home.streakDays(user.currentStreak)}</Badge>
        )}
      </div>

      {decks.length > 0 && (
        <TodaySummaryCard
          status={todayStatus}
          today={today}
          nextReviewDeck={nextReviewDeck}
          decks={decks}
          onAddWord={handleAddWord}
        />
      )}

      {addingWord && decks.length > 1 && (
        <DeckPicker decks={decks} onClose={() => setAddingWord(false)} />
      )}

      <div className="home__header">
        <h2 className="home__section-title">{t.home.deckList.title}</h2>
        <Button onClick={() => setCreating(true)}>{t.home.deckList.newDeck}</Button>
      </div>

      {status === 'loading' && (
        <div className="home__loading">
          <Spinner label={t.home.deckList.loading} />
        </div>
      )}

      {status === 'error' && <Alert variant="danger">{error}</Alert>}

      {status === 'ok' && (
        <>
          {decks.length === 0 ? (
            <p className="home__empty">{t.home.deckList.empty}</p>
          ) : (
            <ul className="home__deck-list">
              {decks.map((deck) => (
                <DeckRow key={deck.id} deck={deck} />
              ))}
            </ul>
          )}
        </>
      )}

      {creating && (
        <CreateDeckForm
          key={createFormKey}
          onCreated={handleCreated}
          onCancel={() => setCreating(false)}
        />
      )}
    </div>
  )
}
