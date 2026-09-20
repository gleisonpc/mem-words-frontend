import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { createCard } from '../api/cards'
import { getDeck, listDecks } from '../api/decks'
import { fetchSuggestion } from '../api/dictionaryLookup'
import ApiError from '../api/ApiError'
import useAuthForm from '../auth/useAuthForm'
import { Alert, Button, Card, Spinner } from '../components/ui'
import { CardFields, EMPTY_CARD_VALUES, cardInputFromValues, cardValidate, describeApiError } from './cardForm'
import './AddCardPage.css'

/** `ApiError` de posse/existência: o backend distingue os dois casos, a tela não. */
function isUnavailable(error) {
  return error instanceof ApiError && (error.status === 403 || error.status === 404)
}

/**
 * Formulário de criação de card propriamente dito — isolado em componente
 * próprio, remontado (via `key`, no componente pai) a cada "salvar e criar
 * outra", pela mesma técnica já usada em `HomePage`/`DeckDetailPage`:
 * `useAuthForm` não expõe um jeito de limpar os valores depois de um envio
 * bem-sucedido, e remontar é mais simples do que estender o hook só para
 * este caso.
 */
function AddCardForm({ urlDeckId, deckOptions, onSaved }) {
  const [deckId, setDeckId] = useState(urlDeckId)
  const [suggestion, setSuggestion] = useState(null)

  // Descarta qualquer sugestão em curso quando a palavra ou o baralho
  // escolhido mudam antes dela responder — evita aplicar uma sugestão para
  // uma palavra ou um baralho que não são mais os atuais.
  const suggestionRequestId = useRef(0)

  const submitIntent = useRef('save')

  const submit = useCallback(
    async (values) => {
      const card = await createCard(deckId, cardInputFromValues(values))
      onSaved(submitIntent.current, deckId, card)
    },
    [deckId, onSaved],
  )

  const { values, change, fieldErrors, generalError, submitting, handleSubmit } = useAuthForm({
    initialValues: EMPTY_CARD_VALUES,
    validate: cardValidate,
    submit,
    describeError: describeApiError('Não foi possível criar o card.'),
  })

  const handleWordChange = (event) => {
    suggestionRequestId.current += 1
    setSuggestion(null)
    change('word')(event)
  }

  // `CardFields` chama `fieldChange(nomeDoCampo)` para obter o handler de
  // cada campo — só o de "word" precisa do descarte de sugestão acima, os
  // demais usam o `change` de `useAuthForm` direto.
  const fieldChange = (field) => (field === 'word' ? handleWordChange : change(field))

  const handleDeckChange = (event) => {
    suggestionRequestId.current += 1
    setSuggestion(null)
    setDeckId(event.target.value)
  }

  const handleWordBlur = useCallback(async () => {
    const word = values.word.trim()
    const selectedDeck = deckOptions.find((deck) => deck.id === deckId)

    if (word === '' || !selectedDeck) {
      return
    }

    // O backend decide se o par de idiomas é reconhecido — responde
    // `suggestion: null` sem chamar serviço externo algum quando não é.
    const requestId = ++suggestionRequestId.current
    const found = await fetchSuggestion({
      word,
      sourceLanguage: selectedDeck.sourceLanguage,
      targetLanguage: selectedDeck.targetLanguage,
    })

    // A palavra ou o baralho podem ter mudado enquanto a busca estava em
    // curso — uma resposta atrasada não pode sobrescrever o estado atual.
    if (requestId !== suggestionRequestId.current) {
      return
    }

    setSuggestion(found)
  }, [values.word, deckId, deckOptions])

  const applySuggestion = () => {
    if (suggestion.translation !== undefined) {
      change('translation')({ target: { value: suggestion.translation } })
    }

    if (suggestion.exampleSentence !== undefined) {
      change('exampleSentence')({ target: { value: suggestion.exampleSentence } })
    }

    if (suggestion.synonyms !== undefined) {
      change('synonyms')({ target: { value: suggestion.synonyms.join(', ') } })
    }

    setSuggestion(null)
  }

  return (
    <form className="deck-form" onSubmit={handleSubmit} noValidate>
      {generalError && <Alert variant={generalError.variant}>{generalError.message}</Alert>}

      {suggestion && (
        <Alert variant="info">
          <div className="add-card-suggestion">
            <p className="add-card-suggestion__title">Sugestão do dicionário</p>

            {suggestion.translation && (
              <p className="add-card-suggestion__item">
                Tradução: <strong>{suggestion.translation}</strong>
              </p>
            )}
            {suggestion.exampleSentence && (
              <p className="add-card-suggestion__item">Exemplo: “{suggestion.exampleSentence}”</p>
            )}
            {suggestion.synonyms && (
              <p className="add-card-suggestion__item">
                Sinônimos: {suggestion.synonyms.join(', ')}
              </p>
            )}

            <div className="add-card-suggestion__actions">
              <Button type="button" size="sm" onClick={applySuggestion}>
                Usar sugestão
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSuggestion(null)}
              >
                Descartar
              </Button>
            </div>
          </div>
        </Alert>
      )}

      <div className="add-card-form__grid">
        <CardFields
          values={values}
          change={fieldChange}
          fieldErrors={fieldErrors}
          disabled={submitting}
          onWordBlur={handleWordBlur}
          extraField={
            <div className="ms-field">
              <label className="ms-field__label" htmlFor="add-card-deck">
                Baralho
              </label>
              <select
                id="add-card-deck"
                className="ms-field__control"
                value={deckId}
                onChange={handleDeckChange}
                disabled={submitting}
              >
                {deckOptions.map((deck) => (
                  <option key={deck.id} value={deck.id}>
                    {deck.name}
                  </option>
                ))}
              </select>
            </div>
          }
        />
      </div>

      <div className="deck-form__actions">
        <Button
          type="submit"
          variant="secondary"
          loading={submitting}
          onClick={() => {
            submitIntent.current = 'save-and-continue'
          }}
        >
          {submitting ? 'Salvando...' : 'Salvar e criar outra'}
        </Button>
        <Button
          type="submit"
          loading={submitting}
          onClick={() => {
            submitIntent.current = 'save'
          }}
        >
          {submitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}

/** Tela de criação de card, própria e endereçável por URL. */
export default function AddCardPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [deckStatus, setDeckStatus] = useState('loading')
  const [deck, setDeck] = useState(null)
  const [deckError, setDeckError] = useState(null)
  const [decks, setDecks] = useState([])
  const [formKey, setFormKey] = useState(0)

  const loadDeck = useCallback(async () => {
    setDeckStatus('loading')

    try {
      setDeck(await getDeck(id))
      setDeckStatus('ok')
    } catch (error) {
      setDeckError(
        isUnavailable(error)
          ? 'Este baralho não está disponível.'
          : error instanceof ApiError
            ? error.message
            : 'Não foi possível carregar o baralho.',
      )
      setDeckStatus('error')
    }
  }, [id])

  const loadDecks = useCallback(async () => {
    try {
      setDecks(await listDecks())
    } catch {
      // Lista indisponível não impede criar no baralho da URL — o campo de
      // baralho cai de volta a mostrar só ele (ver `deckOptions`).
    }
  }, [])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    loadDeck()
    // oxlint-disable-next-line react/set-state-in-effect
    loadDecks()
  }, [loadDeck, loadDecks])

  const handleSaved = useCallback(
    (intent, savedDeckId) => {
      if (intent === 'save-and-continue') {
        setFormKey((current) => current + 1)
        return
      }

      navigate(`/baralhos/${savedDeckId}`)
    },
    [navigate],
  )

  const backLink = (
    <Link className="deck-detail__back" to={`/baralhos/${id}`}>
      ← Baralho
    </Link>
  )

  if (deckStatus === 'loading') {
    return (
      <div className="deck-detail">
        {backLink}
        <div className="deck-detail__loading">
          <Spinner label="Carregando baralho..." />
        </div>
      </div>
    )
  }

  if (deckStatus === 'error') {
    return (
      <div className="deck-detail">
        {backLink}
        <Card title="Baralho indisponível">
          <Alert variant="danger">{deckError}</Alert>
        </Card>
      </div>
    )
  }

  // O baralho da URL nem sempre está em `decks` ainda (lista mais lenta, ou
  // falhou) — garante que o `<select>` sempre tem ao menos esse baralho,
  // pré-selecionado como o mockup pede.
  const deckOptions = decks.some((item) => item.id === deck.id) ? decks : [deck, ...decks]

  return (
    <div className="deck-detail">
      {backLink}

      <Card title="Novo card">
        <AddCardForm key={formKey} urlDeckId={id} deckOptions={deckOptions} onSaved={handleSaved} />
      </Card>
    </div>
  )
}
