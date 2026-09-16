import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { createDeck, listDecks } from '../api/decks'
import ApiError from '../api/ApiError'
import useAuthForm from '../auth/useAuthForm'
import { collect } from '../auth/validation'
import { Alert, Button, Card, Input, Spinner } from '../components/ui'
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

/** Formulário de criação de um baralho novo. */
function CreateDeckForm({ onCreated }) {
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
          <Button type="submit" loading={submitting}>
            {submitting ? 'Criando...' : 'Criar baralho'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

/** Tela inicial da área autenticada: lista os baralhos do usuário. */
export default function HomePage() {
  const [status, setStatus] = useState('loading')
  const [decks, setDecks] = useState([])
  const [error, setError] = useState(null)
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

  // Baralho criado aparece na lista sem nova ida ao backend: a resposta da
  // criação já traz tudo que a lista exibe.
  const handleCreated = useCallback((deck) => {
    setDecks((current) => [...current, deck])
    setCreateFormKey((current) => current + 1)
  }, [])

  return (
    <div className="home">
      <Card title="Seus baralhos">
        {status === 'loading' && (
          <div className="home__loading">
            <Spinner label="Carregando baralhos..." />
          </div>
        )}

        {status === 'error' && <Alert variant="danger">{error}</Alert>}

        {status === 'ok' && decks.length === 0 && (
          <p className="home__empty">Você ainda não tem baralhos. Crie o primeiro abaixo.</p>
        )}

        {status === 'ok' && decks.length > 0 && (
          <ul className="home__decks">
            {decks.map((deck) => (
              <li key={deck.id}>
                <Link className="home__deck" to={`/baralhos/${deck.id}`}>
                  <span className="home__deck-name">{deck.name}</span>
                  <span className="home__deck-languages">
                    {deck.sourceLanguage} → {deck.targetLanguage}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <CreateDeckForm key={createFormKey} onCreated={handleCreated} />
    </div>
  )
}
