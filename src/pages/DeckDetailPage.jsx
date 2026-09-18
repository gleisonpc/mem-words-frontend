import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { deleteDeck, getDeck, updateDeck } from '../api/decks'
import {
  createCard,
  deleteCard,
  listCards,
  suspendCard,
  unsuspendCard,
  updateCard,
} from '../api/cards'
import { getReviewQueue } from '../api/reviews'
import ApiError from '../api/ApiError'
import useAuthForm from '../auth/useAuthForm'
import { collect } from '../auth/validation'
import {
  Alert,
  Badge,
  Button,
  Card,
  ConfirmDeleteButton,
  Input,
  Pagination,
  Spinner,
} from '../components/ui'
import './DeckDetailPage.css'

const PAGE_SIZE = 10

/** Debounce da busca por palavra — a primeira busca em texto contra o backend. */
const SEARCH_DEBOUNCE_MS = 300

/** Variante de `Badge` e rótulo de cada status calculado pelo backend. */
const STATUS_BADGES = {
  new: { variant: 'info', label: 'Novo' },
  learning: { variant: 'warning', label: 'Aprend.' },
  difficult: { variant: 'danger', label: 'Difícil' },
  mature: { variant: 'success', label: 'Maduro' },
  reviewing: { variant: 'neutral', label: 'Revisão' },
  suspended: { variant: 'neutral', label: 'Suspenso' },
}

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'new', label: 'Novo' },
  { value: 'learning', label: 'Aprendendo' },
  { value: 'difficult', label: 'Difícil' },
  { value: 'mature', label: 'Maduro' },
  { value: 'reviewing', label: 'Em revisão' },
  { value: 'suspended', label: 'Suspenso' },
]

function statusBadge(status) {
  return STATUS_BADGES[status] ?? { variant: 'neutral', label: status }
}

/** Rótulo curto da próxima revisão de um card — "hoje"/"amanhã"/"em Nd"/"—". */
function formatNextReview(dueAt, now) {
  if (dueAt === null) {
    return '—'
  }

  const diffDays = Math.ceil((new Date(dueAt).getTime() - now.getTime()) / 86_400_000)

  if (diffDays <= 0) {
    return 'hoje'
  }

  if (diffDays === 1) {
    return 'amanhã'
  }

  return `em ${diffDays}d`
}

/** `ApiError` de posse/existência: o backend distingue os dois casos, a tela não. */
function isUnavailable(error) {
  return error instanceof ApiError && (error.status === 403 || error.status === 404)
}

const CREATED_MONTH_FORMAT = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })

/** "criado em <mês> de <ano>", a partir de `createdAt`. */
function formatCreatedMonth(createdAt) {
  return CREATED_MONTH_FORMAT.format(new Date(createdAt))
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

/** Um bloco de contagem por status — número grande sob um rótulo, como `Card` já estiliza. */
function StatTile({ label, value }) {
  return (
    <Card title={label} className="deck-detail__stat">
      <p className="deck-detail__stat-value">{value}</p>
    </Card>
  )
}

/** Os quatro blocos de contagem por status do baralho. */
function DeckStats({ deck }) {
  return (
    <div className="deck-detail__stats">
      <StatTile label="Novos" value={deck.newCount ?? 0} />
      <StatTile label="Aprendendo" value={deck.learningCount ?? 0} />
      <StatTile label="Maduros" value={deck.matureCount ?? 0} />
      <StatTile label="Suspensos" value={deck.suspendedCount ?? 0} />
    </div>
  )
}

/** Cabeçalho do baralho: exibição, edição, exclusão e início de revisão. */
function DeckHeader({ deck, reviewCount, onUpdated, onDeleted }) {
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

      <p className="deck-detail__meta">
        {deck.cardCount} {deck.cardCount === 1 ? 'card' : 'cards'} · {deck.sourceLanguage} →{' '}
        {deck.targetLanguage} · criado em {formatCreatedMonth(deck.createdAt)}
      </p>

      <div className="deck-detail__review-cta">
        {reviewCount !== null && (
          <span className="deck-detail__review-count">
            {reviewCount} {reviewCount === 1 ? 'pronto' : 'prontos'} para revisão
          </span>
        )}
        <Link
          to={`/baralhos/${deck.id}/revisar`}
          className="ms-button ms-button--primary ms-button--md"
        >
          Revisar
        </Link>
      </div>
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

/** Um card na lista: exibição, edição, exclusão e suspensão. */
function CardItem({ card, now, onUpdated, onDeleted, onSuspendToggled }) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [suspending, setSuspending] = useState(false)
  const [suspendError, setSuspendError] = useState(null)

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

  const handleSuspendToggle = useCallback(async () => {
    setSuspending(true)
    setSuspendError(null)

    try {
      const updated = card.suspended ? await unsuspendCard(card.id) : await suspendCard(card.id)
      await onSuspendToggled(updated)
    } catch (error) {
      setSuspendError(
        error instanceof ApiError
          ? error.message
          : `Não foi possível ${card.suspended ? 'reativar' : 'suspender'} o card.`,
      )
    } finally {
      setSuspending(false)
    }
  }, [card.id, card.suspended, onSuspendToggled])

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

  const badge = statusBadge(card.status)

  return (
    <li className="deck-detail__card">
      {deleteError && <Alert variant="danger">{deleteError}</Alert>}
      {suspendError && <Alert variant="danger">{suspendError}</Alert>}

      <div className="deck-detail__card-main">
        <div>
          <p className="deck-detail__card-word">{card.word}</p>
          <p className="deck-detail__card-translation">{card.translation}</p>
        </div>

        <div className="deck-detail__card-status">
          <Badge variant={badge.variant}>{badge.label}</Badge>
          <span className="deck-detail__card-next-review">{formatNextReview(card.dueAt, now)}</span>
        </div>

        <div className="deck-detail__card-actions">
          <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
            Editar
          </Button>
          <Button
            variant="secondary"
            size="sm"
            loading={suspending}
            onClick={handleSuspendToggle}
          >
            {card.suspended ? 'Reativar' : 'Suspender'}
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

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // `null` enquanto não sabemos — falha ao buscar não impede o resto da
  // tela, só some com a contagem (o botão de revisar continua alcançável).
  const [reviewCount, setReviewCount] = useState(null)
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

  // Atualiza os campos do baralho (contagens por status) sem passar pelo
  // estado de carregamento de página inteira — usado depois de criar,
  // excluir ou suspender/reativar um card, quando o resto da tela já está
  // exibida e só as contagens ficaram desatualizadas.
  const refreshDeckStats = useCallback(async () => {
    try {
      setDeck(await getDeck(id))
    } catch {
      // Falha aqui só deixa as contagens desatualizadas até a próxima
      // ação — não vale substituir a tela inteira por um erro por causa
      // disso.
    }
  }, [id])

  const loadCards = useCallback(async () => {
    setCardsStatus('loading')

    try {
      const result = await listCards(id, {
        page,
        pageSize: PAGE_SIZE,
        ...(debouncedSearch.trim() !== '' && { q: debouncedSearch.trim() }),
        ...(statusFilter !== '' && { status: statusFilter }),
      })
      setCards(result.items)
      setTotal(result.total)
      setCardsStatus('ok')
    } catch {
      setCardsStatus('error')
    }
  }, [id, page, debouncedSearch, statusFilter])

  const loadReviewCount = useCallback(async () => {
    try {
      setReviewCount((await getReviewQueue(id)).length)
    } catch {
      setReviewCount(null)
    }
  }, [id])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    loadDeck()
  }, [loadDeck])

  useEffect(() => {
    if (deckStatus === 'ok') {
      // oxlint-disable-next-line react/set-state-in-effect
      loadCards()
      // oxlint-disable-next-line react/set-state-in-effect
      loadReviewCount()
    }
  }, [deckStatus, loadCards, loadReviewCount])

  // Debounce só na busca por texto — o filtro por status é uma escolha
  // discreta (um clique), não precisa esperar digitação.
  useEffect(() => {
    const timeout = setTimeout(() => {
      // oxlint-disable-next-line react/set-state-in-effect
      setDebouncedSearch(search)
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timeout)
  }, [search])

  // Buscar ou filtrar reinicia a paginação — a página atual pode não
  // existir mais no conjunto filtrado.
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    setPage(1)
  }, [debouncedSearch, statusFilter])

  if (deckStatus === 'loading') {
    return (
      <div className="deck-detail">
        <Link className="deck-detail__back" to="/">
          ← Baralhos
        </Link>
        <div className="deck-detail__loading">
          <Spinner label="Carregando baralho..." />
        </div>
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
    setCreateFormKey((current) => current + 1)
    // Um card novo muda `cardCount` e `newCount` no baralho — recarregar
    // o baralho evita patchear os cinco campos de contagem à mão.
    refreshDeckStats()
    loadCards()
  }

  const handleCardUpdated = (updated) => {
    // Edição não muda quantos cards existem nem sua ordem — atualizar em
    // memória evita uma ida ao servidor sem motivo.
    setCards((current) => current.map((c) => (c.id === updated.id ? updated : c)))
  }

  const handleCardDeleted = async () => {
    refreshDeckStats()

    // Excluir o único card da última página deixaria a página atual vazia;
    // voltar uma página já dispara o efeito que recarrega os cards dela.
    if (cards.length === 1 && page > 1) {
      setPage((current) => current - 1)
      return
    }

    await loadCards()
  }

  const now = new Date()
  const isFiltering = debouncedSearch.trim() !== '' || statusFilter !== ''

  const handleCardSuspendToggled = (updated) => {
    setCards((current) => current.map((c) => (c.id === updated.id ? updated : c)))
    // Suspender/reativar muda `matureCount`/`suspendedCount` (e, se o card
    // nunca foi revisado, também `newCount`) — recarregar o baralho evita
    // recalcular a prioridade entre status no cliente.
    refreshDeckStats()
  }

  return (
    <div className="deck-detail">
      <Link className="deck-detail__back" to="/">
        ← Baralhos
      </Link>

      <DeckHeader
        deck={deck}
        reviewCount={reviewCount}
        onUpdated={setDeck}
        onDeleted={() => navigate('/', { replace: true })}
      />

      <DeckStats deck={deck} />

      <Card title="Cards">
        <div className="deck-detail__filters">
          <Input
            label="Buscar palavra"
            name="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ex.: overwhelm"
          />

          <div className="ms-field">
            <label className="ms-field__label" htmlFor="deck-detail-status-filter">
              Status
            </label>
            <select
              id="deck-detail-status-filter"
              className="ms-field__control"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {STATUS_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {cardsStatus === 'loading' && (
          <div className="deck-detail__loading">
            <Spinner label="Carregando cards..." />
          </div>
        )}

        {cardsStatus === 'error' && (
          <Alert variant="danger">Não foi possível carregar os cards deste baralho.</Alert>
        )}

        {cardsStatus === 'ok' && cards.length === 0 && (
          <p className="deck-detail__empty">
            {isFiltering ? 'Nenhum card encontrado.' : 'Este baralho ainda não tem cards.'}
          </p>
        )}

        {cardsStatus === 'ok' && cards.length > 0 && (
          <>
            <ul className="deck-detail__cards">
              {cards.map((card) => (
                <CardItem
                  key={card.id}
                  card={card}
                  now={now}
                  onUpdated={handleCardUpdated}
                  onDeleted={handleCardDeleted}
                  onSuspendToggled={handleCardSuspendToggled}
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
