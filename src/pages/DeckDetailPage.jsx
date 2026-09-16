import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { deleteDeck, getDeck, updateDeck } from '../api/decks'
import { createCard, deleteCard, listCards, updateCard } from '../api/cards'
import ApiError from '../api/ApiError'
import useAuthForm from '../auth/useAuthForm'
import { collect } from '../auth/validation'
import {
  Alert,
  Button,
  Card,
  ConfirmDeleteButton,
  Input,
  Pagination,
  Spinner,
} from '../components/ui'
import './DeckDetailPage.css'

const PAGE_SIZE = 10

/** `ApiError` de posse/existência: o backend distingue os dois casos, a tela não. */
function isUnavailable(error) {
  return error instanceof ApiError && (error.status === 403 || error.status === 404)
}

function requiredText(value, label) {
  return value.trim() === '' ? `Informe ${label}.` : null
}

/** Converte um campo opcional de texto: vazio vira "sem valor" (omitido no envio). */
function optionalText(value) {
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

function synonymsToText(synonyms) {
  return (synonyms ?? []).join(', ')
}

/** Sinônimos aceitam array vazio explícito — diferente dos demais opcionais, que
 * o backend não permite limpar de volta (ver design.md). */
function textToSynonyms(value) {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s !== '')
}

function describeApiError(fallback) {
  return (error) => ({
    variant: 'danger',
    message: error instanceof ApiError ? error.message : fallback,
  })
}

/** Formulário de nome/idiomas — reaproveitado para editar o baralho. */
function DeckEditForm({ deck, onSaved, onCancel }) {
  const submit = useCallback(
    async (values) => {
      onSaved(await updateDeck(deck.id, values))
    },
    [deck.id, onSaved],
  )

  const validate = useCallback(
    (values) =>
      collect({
        name: requiredText(values.name, 'o nome do baralho'),
        sourceLanguage: requiredText(values.sourceLanguage, 'o idioma de origem'),
        targetLanguage: requiredText(values.targetLanguage, 'o idioma de destino'),
      }),
    [],
  )

  const { values, change, fieldErrors, generalError, submitting, handleSubmit } = useAuthForm({
    initialValues: {
      name: deck.name,
      sourceLanguage: deck.sourceLanguage,
      targetLanguage: deck.targetLanguage,
    },
    validate,
    submit,
    describeError: describeApiError('Não foi possível salvar o baralho.'),
  })

  return (
    <form className="deck-form" onSubmit={handleSubmit} noValidate>
      {generalError && <Alert variant={generalError.variant}>{generalError.message}</Alert>}

      <Input
        label="Nome"
        name="name"
        value={values.name}
        onChange={change('name')}
        error={fieldErrors.name}
        disabled={submitting}
      />
      <Input
        label="Idioma de origem"
        name="sourceLanguage"
        value={values.sourceLanguage}
        onChange={change('sourceLanguage')}
        error={fieldErrors.sourceLanguage}
        disabled={submitting}
      />
      <Input
        label="Idioma de destino"
        name="targetLanguage"
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
          {submitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}

/** Cabeçalho do baralho: exibição, edição e exclusão. */
function DeckHeader({ deck, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const handleDelete = useCallback(async () => {
    setDeleting(true)
    setDeleteError(null)

    try {
      await deleteDeck(deck.id)
      onDeleted()
    } catch (error) {
      setDeleteError(
        error instanceof ApiError ? error.message : 'Não foi possível excluir o baralho.',
      )
    } finally {
      setDeleting(false)
    }
  }, [deck.id, onDeleted])

  if (editing) {
    return (
      <Card title="Editar baralho">
        <DeckEditForm
          deck={deck}
          onSaved={(updated) => {
            onUpdated(updated)
            setEditing(false)
          }}
          onCancel={() => setEditing(false)}
        />
      </Card>
    )
  }

  return (
    <Card
      title={deck.name}
      actions={
        <>
          <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
            Editar
          </Button>
          <ConfirmDeleteButton onConfirm={handleDelete} pending={deleting}>
            Excluir baralho
          </ConfirmDeleteButton>
        </>
      }
    >
      {deleteError && <Alert variant="danger">{deleteError}</Alert>}

      <dl className="deck-detail__meta">
        <dt>Idiomas</dt>
        <dd>
          {deck.sourceLanguage} → {deck.targetLanguage}
        </dd>
        <dt>Cards</dt>
        <dd>{deck.cardCount}</dd>
      </dl>
    </Card>
  )
}

function cardValidate(values) {
  return collect({
    word: requiredText(values.word, 'a palavra'),
    translation: requiredText(values.translation, 'a tradução'),
  })
}

function cardInputFromValues(values) {
  return {
    word: values.word.trim(),
    translation: values.translation.trim(),
    partOfSpeech: optionalText(values.partOfSpeech),
    synonyms: textToSynonyms(values.synonyms),
    exampleSentence: optionalText(values.exampleSentence),
    exampleTranslation: optionalText(values.exampleTranslation),
    personalNote: optionalText(values.personalNote),
  }
}

const EMPTY_CARD_VALUES = {
  word: '',
  translation: '',
  partOfSpeech: '',
  synonyms: '',
  exampleSentence: '',
  exampleTranslation: '',
  personalNote: '',
}

function cardFields(values, change, fieldErrors, disabled) {
  return (
    <>
      <Input
        label="Palavra"
        name="word"
        value={values.word}
        onChange={change('word')}
        error={fieldErrors.word}
        disabled={disabled}
      />
      <Input
        label="Tradução"
        name="translation"
        value={values.translation}
        onChange={change('translation')}
        error={fieldErrors.translation}
        disabled={disabled}
      />
      <Input
        label="Classe gramatical"
        name="partOfSpeech"
        placeholder="ex.: substantivo"
        value={values.partOfSpeech}
        onChange={change('partOfSpeech')}
        error={fieldErrors.partOfSpeech}
        disabled={disabled}
      />
      <Input
        label="Sinônimos"
        name="synonyms"
        placeholder="separados por vírgula"
        value={values.synonyms}
        onChange={change('synonyms')}
        error={fieldErrors.synonyms}
        disabled={disabled}
      />
      <Input
        label="Frase de exemplo"
        name="exampleSentence"
        value={values.exampleSentence}
        onChange={change('exampleSentence')}
        error={fieldErrors.exampleSentence}
        disabled={disabled}
      />
      <Input
        label="Tradução da frase"
        name="exampleTranslation"
        value={values.exampleTranslation}
        onChange={change('exampleTranslation')}
        error={fieldErrors.exampleTranslation}
        disabled={disabled}
      />
      <Input
        label="Anotação pessoal"
        name="personalNote"
        value={values.personalNote}
        onChange={change('personalNote')}
        error={fieldErrors.personalNote}
        disabled={disabled}
      />
    </>
  )
}

/** Formulário de criação de card. */
function CreateCardForm({ deckId, onCreated }) {
  const submit = useCallback(
    async (values) => {
      const card = await createCard(deckId, cardInputFromValues(values))
      onCreated(card)
    },
    [deckId, onCreated],
  )

  const { values, change, fieldErrors, generalError, submitting, handleSubmit } = useAuthForm({
    initialValues: EMPTY_CARD_VALUES,
    validate: cardValidate,
    submit,
    describeError: describeApiError('Não foi possível criar o card.'),
  })

  return (
    <Card title="Novo card">
      {generalError && <Alert variant={generalError.variant}>{generalError.message}</Alert>}

      <form className="deck-form" onSubmit={handleSubmit} noValidate>
        {cardFields(values, change, fieldErrors, submitting)}

        <div className="deck-form__actions">
          <Button type="submit" loading={submitting}>
            {submitting ? 'Criando...' : 'Criar card'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

/** Formulário de edição de um card existente. */
function CardEditForm({ card, onSaved, onCancel }) {
  const submit = useCallback(
    async (values) => {
      onSaved(await updateCard(card.id, cardInputFromValues(values)))
    },
    [card.id, onSaved],
  )

  const { values, change, fieldErrors, generalError, submitting, handleSubmit } = useAuthForm({
    initialValues: {
      word: card.word,
      translation: card.translation,
      partOfSpeech: card.partOfSpeech ?? '',
      synonyms: synonymsToText(card.synonyms),
      exampleSentence: card.exampleSentence ?? '',
      exampleTranslation: card.exampleTranslation ?? '',
      personalNote: card.personalNote ?? '',
    },
    validate: cardValidate,
    submit,
    describeError: describeApiError('Não foi possível salvar o card.'),
  })

  return (
    <form className="deck-form" onSubmit={handleSubmit} noValidate>
      {generalError && <Alert variant={generalError.variant}>{generalError.message}</Alert>}

      {cardFields(values, change, fieldErrors, submitting)}

      <div className="deck-form__actions">
        <Button variant="ghost" type="button" disabled={submitting} onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={submitting}>
          {submitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}

/** Um card na lista: exibição, edição e exclusão. */
function CardItem({ card, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const handleDelete = useCallback(async () => {
    setDeleting(true)
    setDeleteError(null)

    try {
      await deleteCard(card.id)
      await onDeleted(card.id)
    } catch (error) {
      setDeleteError(error instanceof ApiError ? error.message : 'Não foi possível excluir o card.')
    } finally {
      setDeleting(false)
    }
  }, [card.id, onDeleted])

  if (editing) {
    return (
      <li className="deck-detail__card">
        <CardEditForm
          card={card}
          onSaved={(updated) => {
            onUpdated(updated)
            setEditing(false)
          }}
          onCancel={() => setEditing(false)}
        />
      </li>
    )
  }

  return (
    <li className="deck-detail__card">
      {deleteError && <Alert variant="danger">{deleteError}</Alert>}

      <div className="deck-detail__card-main">
        <div>
          <p className="deck-detail__card-word">{card.word}</p>
          <p className="deck-detail__card-translation">{card.translation}</p>
        </div>

        <div className="deck-detail__card-actions">
          <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
            Editar
          </Button>
          <ConfirmDeleteButton onConfirm={handleDelete} pending={deleting} />
        </div>
      </div>

      {(card.partOfSpeech || card.synonyms?.length > 0) && (
        <p className="deck-detail__card-detail">
          {card.partOfSpeech}
          {card.partOfSpeech && card.synonyms?.length > 0 ? ' · ' : ''}
          {card.synonyms?.length > 0 && `sinônimos: ${card.synonyms.join(', ')}`}
        </p>
      )}

      {card.exampleSentence && (
        <p className="deck-detail__card-detail">
          {card.exampleSentence}
          {card.exampleTranslation && ` — ${card.exampleTranslation}`}
        </p>
      )}

      {card.personalNote && <p className="deck-detail__card-note">{card.personalNote}</p>}
    </li>
  )
}

/** Tela de detalhe de um baralho: dados do baralho e seus cards, paginados. */
export default function DeckDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [deckStatus, setDeckStatus] = useState('loading')
  const [deck, setDeck] = useState(null)
  const [deckError, setDeckError] = useState(null)

  const [cardsStatus, setCardsStatus] = useState('loading')
  const [cards, setCards] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  // Muda a cada card criado, para remontar `CreateCardForm` com campos
  // vazios — `useAuthForm` não limpa os valores depois de um envio
  // bem-sucedido, porque nas telas de autenticação o sucesso navega para
  // outro lugar; aqui o formulário continua na tela.
  const [createFormKey, setCreateFormKey] = useState(0)

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

  const loadCards = useCallback(async () => {
    setCardsStatus('loading')

    try {
      const result = await listCards(id, { page, pageSize: PAGE_SIZE })
      setCards(result.items)
      setTotal(result.total)
      setCardsStatus('ok')
    } catch {
      setCardsStatus('error')
    }
  }, [id, page])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    loadDeck()
  }, [loadDeck])

  useEffect(() => {
    if (deckStatus === 'ok') {
      // oxlint-disable-next-line react/set-state-in-effect
      loadCards()
    }
  }, [deckStatus, loadCards])

  if (deckStatus === 'loading') {
    return (
      <div className="deck-detail__loading">
        <Spinner label="Carregando baralho..." />
      </div>
    )
  }

  if (deckStatus === 'error') {
    return (
      <Card title="Baralho indisponível">
        <Alert variant="danger">{deckError}</Alert>
        <p>
          <Link to="/">Voltar para os baralhos</Link>
        </p>
      </Card>
    )
  }

  // Criar e excluir mudam quantos cards existem e, por tabela, quantas
  // páginas há — recarregar a página atual do servidor (a mesma técnica de
  // `reload()` documentada no design.md) evita que a lista em memória fique
  // com mais ou menos itens do que o tamanho de página permite.
  const handleCardCreated = (card) => {
    void card
    setDeck((current) => ({ ...current, cardCount: current.cardCount + 1 }))
    setCreateFormKey((current) => current + 1)
    loadCards()
  }

  const handleCardUpdated = (updated) => {
    // Edição não muda quantos cards existem nem sua ordem — atualizar em
    // memória evita uma ida ao servidor sem motivo.
    setCards((current) => current.map((c) => (c.id === updated.id ? updated : c)))
  }

  const handleCardDeleted = async () => {
    setDeck((current) => ({ ...current, cardCount: current.cardCount - 1 }))

    // Excluir o único card da última página deixaria a página atual vazia;
    // voltar uma página já dispara o efeito que recarrega os cards dela.
    if (cards.length === 1 && page > 1) {
      setPage((current) => current - 1)
      return
    }

    await loadCards()
  }

  return (
    <div className="deck-detail">
      <DeckHeader
        deck={deck}
        onUpdated={setDeck}
        onDeleted={() => navigate('/', { replace: true })}
      />

      <Card title="Cards">
        {cardsStatus === 'loading' && (
          <div className="deck-detail__loading">
            <Spinner label="Carregando cards..." />
          </div>
        )}

        {cardsStatus === 'error' && (
          <Alert variant="danger">Não foi possível carregar os cards deste baralho.</Alert>
        )}

        {cardsStatus === 'ok' && cards.length === 0 && (
          <p className="deck-detail__empty">Este baralho ainda não tem cards.</p>
        )}

        {cardsStatus === 'ok' && cards.length > 0 && (
          <>
            <ul className="deck-detail__cards">
              {cards.map((card) => (
                <CardItem
                  key={card.id}
                  card={card}
                  onUpdated={handleCardUpdated}
                  onDeleted={handleCardDeleted}
                />
              ))}
            </ul>

            {total > PAGE_SIZE && (
              <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
            )}
          </>
        )}
      </Card>

      <CreateCardForm key={createFormKey} deckId={id} onCreated={handleCardCreated} />
    </div>
  )
}
