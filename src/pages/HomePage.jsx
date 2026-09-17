import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { createDeck, listDecks } from '../api/decks'
import ApiError from '../api/ApiError'
import useAuthForm from '../auth/useAuthForm'
import { collect } from '../auth/validation'
import { Alert, Badge, Button, Card, Input, ProgressBar, Spinner } from '../components/ui'
import './HomePage.css'

const NAME_MAX = 120

function validateName(value) {
  const name = value.trim()

  if (name === '') {
    return 'Informe o nome do baralho.'
  }

  if (name.length > NAME_MAX) {
    return `O nome deve ter no máximo ${NAME_MAX} caracteres.`
  }

  return null
}

function validateLanguage(value) {
  const language = value.trim()

  if (language === '') {
    return 'Informe o idioma.'
  }

  return null
}

function validate(values) {
  return collect({
    name: validateName(values.name),
    sourceLanguage: validateLanguage(values.sourceLanguage),
    targetLanguage: validateLanguage(values.targetLanguage),
  })
}

function describeError(error) {
  const message = error instanceof ApiError ? error.message : 'Não foi possível criar o baralho.'
  return { variant: 'danger', message }
}

/** Formulário de criação de um baralho novo, revelado sob demanda. */
function CreateDeckForm({ onCreated, onCancel }) {
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
    <Card title="Novo baralho">
      {generalError && <Alert variant={generalError.variant}>{generalError.message}</Alert>}

      <form className="deck-form" onSubmit={handleSubmit} noValidate>
        <Input
          label="Nome"
          name="name"
          autoComplete="off"
          value={values.name}
          onChange={change('name')}
          error={fieldErrors.name}
          disabled={submitting}
        />

        <Input
          label="Idioma de origem"
          name="sourceLanguage"
          placeholder="ex.: pt-br"
          autoComplete="off"
          value={values.sourceLanguage}
          onChange={change('sourceLanguage')}
          error={fieldErrors.sourceLanguage}
          disabled={submitting}
        />

        <Input
          label="Idioma de destino"
          name="targetLanguage"
          placeholder="ex.: en"
          autoComplete="off"
          value={values.targetLanguage}
          onChange={change('targetLanguage')}
          error={fieldErrors.targetLanguage}
          disabled={submitting}
        />

        <div className="deck-form__actions">
          <Button variant="ghost" type="button" disabled={submitting} onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" loading={submitting}>
            {submitting ? 'Criando...' : 'Criar baralho'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

/** Selo de quantos cards estão prontos para revisão agora, ou "em dia". */
function DueBadge({ dueCount }) {
  if (dueCount > 0) {
    return <Badge variant="warning">{dueCount} hoje</Badge>
  }

  return <Badge variant="success">em dia</Badge>
}

/**
 * Um baralho na grade: nome, selo de prontos, total de cards e idiomas, e
 * o progresso de maturidade — tudo que o backend já manda pronto em
 * `GET /decks`, sem chamada extra por baralho.
 */
function DeckTile({ deck }) {
  const cardCount = deck.cardCount ?? 0
  const dueCount = deck.dueCount ?? 0
  const matureCount = deck.matureCount ?? 0
  const maturePercent = cardCount > 0 ? Math.round((matureCount / cardCount) * 100) : 0

  return (
    <Link className="home__deck" to={`/baralhos/${deck.id}`}>
      <div className="home__deck-header">
        <span className="home__deck-name">{deck.name}</span>
        <DueBadge dueCount={dueCount} />
      </div>

      <p className="home__deck-meta">
        {cardCount} {cardCount === 1 ? 'card' : 'cards'} · {deck.sourceLanguage} →{' '}
        {deck.targetLanguage}
      </p>

      {cardCount > 0 ? (
        <>
          <ProgressBar value={matureCount} max={cardCount} />
          <p className="home__deck-mature">{maturePercent}% maduros</p>
        </>
      ) : (
        <p className="home__deck-mature">Sem cards ainda</p>
      )}
    </Link>
  )
}

/** Tela inicial da área autenticada: lista os baralhos do usuário. */
export default function HomePage() {
  const [status, setStatus] = useState('loading')
  const [decks, setDecks] = useState([])
  const [error, setError] = useState(null)
  const [creating, setCreating] = useState(false)
  // Muda a cada baralho criado, para remontar `CreateDeckForm` com campos
  // vazios (ver a mesma técnica em `DeckDetailPage`).
  const [createFormKey, setCreateFormKey] = useState(0)

  const load = useCallback(async () => {
    setStatus('loading')

    try {
      setDecks(await listDecks())
      setStatus('ok')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível carregar os baralhos.')
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    load()
  }, [load])

  // Baralho recém-criado não pode ter card algum — as três contagens
  // entram zeradas sem uma nova ida ao backend só para confirmar isso.
  const handleCreated = useCallback((deck) => {
    setDecks((current) => [...current, { ...deck, cardCount: 0, dueCount: 0, matureCount: 0 }])
    setCreateFormKey((current) => current + 1)
    setCreating(false)
  }, [])

  return (
    <div className="home">
      <div className="home__header">
        <h1 className="home__title">Baralhos</h1>
        <Button onClick={() => setCreating(true)}>Novo baralho</Button>
      </div>

      {status === 'loading' && (
        <div className="home__loading">
          <Spinner label="Carregando baralhos..." />
        </div>
      )}

      {status === 'error' && <Alert variant="danger">{error}</Alert>}

      {status === 'ok' && (
        <>
          {decks.length === 0 && (
            <p className="home__empty">Você ainda não tem baralhos. Crie o primeiro abaixo.</p>
          )}

          <div className="home__grid">
            {decks.map((deck) => (
              <DeckTile key={deck.id} deck={deck} />
            ))}

            <button
              type="button"
              className="home__create-tile"
              onClick={() => setCreating(true)}
            >
              Criar baralho
            </button>
          </div>
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
