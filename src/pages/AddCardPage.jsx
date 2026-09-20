import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { createCard } from '../api/cards'
import { getDeck, listDecks } from '../api/decks'
import { fetchSuggestion } from '../api/dictionaryLookup'
import ApiError from '../api/ApiError'
import useAuthForm from '../auth/useAuthForm'
import { Alert, Button, Card, Spinner } from '../components/ui'
import useTranslations from '../i18n/useTranslations'
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
  const t = useTranslations()
  const [deckId, setDeckId] = useState(urlDeckId)
  const [suggestion, setSuggestion] = useState(null)
  const [searching, setSearching] = useState(false)
  // `null` = ainda não buscou por esta palavra; `true`/`false` depois de uma
  // busca concluída, para mostrar "nada encontrado" só quando cabe — e não
  // antes da primeira busca, nem enquanto uma está em curso.
  const [searchedEmpty, setSearchedEmpty] = useState(false)

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
    describeError: describeApiError(t.addCard.genericError),
  })

  const handleWordChange = (event) => {
    suggestionRequestId.current += 1
    setSuggestion(null)
    setSearchedEmpty(false)
    change('word')(event)
  }

  // `CardFields` chama `fieldChange(nomeDoCampo)` para obter o handler de
  // cada campo — só o de "word" precisa do descarte de sugestão acima, os
  // demais usam o `change` de `useAuthForm` direto.
  const fieldChange = (field) => (field === 'word' ? handleWordChange : change(field))

  const handleDeckChange = (event) => {
    suggestionRequestId.current += 1
    setSuggestion(null)
    setSearchedEmpty(false)
    setDeckId(event.target.value)
  }

  // Busca acionada por um botão explícito, não mais ao sair do campo: a
  // pessoa vê exatamente quando a busca começa e termina (estado de
  // carregando, e uma mensagem quando não encontra nada), em vez de uma
  // sugestão que aparece — ou não — sem nenhum sinal de que algo aconteceu.
  const handleSearchClick = useCallback(async () => {
    const word = values.word.trim()
    const selectedDeck = deckOptions.find((deck) => deck.id === deckId)

    if (word === '' || !selectedDeck) {
      return
    }

    const requestId = ++suggestionRequestId.current
    setSearching(true)
    setSuggestion(null)
    setSearchedEmpty(false)

    // O backend decide se o par de idiomas é reconhecido — responde
    // `suggestion: null` sem chamar serviço externo algum quando não é.
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

    setSearching(false)
    setSuggestion(found)
    setSearchedEmpty(found === null)
  }, [values.word, deckId, deckOptions])

  const applySuggestion = () => {
    if (suggestion.translation !== undefined) {
      change('translation')({ target: { value: suggestion.translation } })
    }

    if (suggestion.exampleSentence !== undefined) {
      change('exampleSentence')({ target: { value: suggestion.exampleSentence } })
    }

    if (suggestion.exampleTranslation !== undefined) {
      change('exampleTranslation')({ target: { value: suggestion.exampleTranslation } })
    }

    if (suggestion.partOfSpeech !== undefined) {
      change('partOfSpeech')({ target: { value: suggestion.partOfSpeech } })
    }

    if (suggestion.synonyms !== undefined) {
      change('synonyms')({ target: { value: suggestion.synonyms.join(', ') } })
    }

    setSuggestion(null)
    setSearchedEmpty(false)
  }

  return (
    <form className="deck-form" onSubmit={handleSubmit} noValidate>
      {generalError && <Alert variant={generalError.variant}>{generalError.message}</Alert>}

      {suggestion && (
        <Alert variant="info">
          <div className="add-card-suggestion">
            <p className="add-card-suggestion__title">{t.addCard.suggestion.title}</p>

            {suggestion.translation && (
              <p className="add-card-suggestion__item">
                {t.addCard.suggestion.translationLabel} <strong>{suggestion.translation}</strong>
              </p>
            )}
            {suggestion.exampleSentence && (
              <p className="add-card-suggestion__item">
                {t.addCard.suggestion.example(suggestion.exampleSentence)}
              </p>
            )}
            {suggestion.exampleTranslation && (
              <p className="add-card-suggestion__item">
                {t.addCard.suggestion.exampleTranslation(suggestion.exampleTranslation)}
              </p>
            )}
            {suggestion.partOfSpeech && (
              <p className="add-card-suggestion__item">
                {t.addCard.suggestion.partOfSpeechLabel} <strong>{suggestion.partOfSpeech}</strong>
              </p>
            )}
            {suggestion.synonyms && (
              <p className="add-card-suggestion__item">
                {t.addCard.suggestion.synonyms(suggestion.synonyms.join(', '))}
              </p>
            )}

            <div className="add-card-suggestion__actions">
              <Button type="button" size="sm" onClick={applySuggestion}>
                {t.addCard.suggestion.use}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSuggestion(null)}
              >
                {t.addCard.suggestion.discard}
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
          wordSearch={
            <div className="add-card-search ms-field--full">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                loading={searching}
                disabled={values.word.trim() === '' || submitting}
                onClick={handleSearchClick}
              >
                {searching ? t.addCard.suggestion.searching : t.addCard.suggestion.searchButton}
              </Button>
              {searchedEmpty && (
                <span className="add-card-search__status">{t.addCard.suggestion.empty}</span>
              )}
            </div>
          }
          extraField={
            <div className="ms-field">
              <label className="ms-field__label" htmlFor="add-card-deck">
                {t.addCard.deckLabel}
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
          {submitting ? t.common.saving : t.addCard.saveAndContinue}
        </Button>
        <Button
          type="submit"
          loading={submitting}
          onClick={() => {
            submitIntent.current = 'save'
          }}
        >
          {submitting ? t.common.saving : t.common.save}
        </Button>
      </div>
    </form>
  )
}

/** Tela de criação de card, própria e endereçável por URL. */
export default function AddCardPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const t = useTranslations()

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
          ? t.addCard.unavailable
          : error instanceof ApiError
            ? error.message
            : t.addCard.loadError,
      )
      setDeckStatus('error')
    }
  }, [id, t])

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
      {t.addCard.backToDeck}
    </Link>
  )

  if (deckStatus === 'loading') {
    return (
      <div className="deck-detail">
        {backLink}
        <div className="deck-detail__loading">
          <Spinner label={t.addCard.loadingDeck} />
        </div>
      </div>
    )
  }

  if (deckStatus === 'error') {
    return (
      <div className="deck-detail">
        {backLink}
        <Card title={t.addCard.unavailableTitle}>
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

      <Card title={t.addCard.cardTitle}>
        <AddCardForm key={formKey} urlDeckId={id} deckOptions={deckOptions} onSaved={handleSaved} />
      </Card>
    </div>
  )
}
