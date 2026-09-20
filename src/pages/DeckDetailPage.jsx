import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { deleteDeck, getDeck, updateDeck } from '../api/decks'
import { deleteCard, listCards, suspendCard, unsuspendCard, updateCard } from '../api/cards'
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
import { getLanguage, localeForLanguage } from '../i18n/language'
import useTranslations, { getTranslations } from '../i18n/useTranslations'
import {
  CardFields,
  cardInputFromValues,
  cardValidate,
  describeApiError,
  requiredText,
  synonymsToText,
} from './cardForm'
import './DeckDetailPage.css'

const PAGE_SIZE = 10

/** Debounce da busca por palavra — a primeira busca em texto contra o backend. */
const SEARCH_DEBOUNCE_MS = 300

/** Variante de `Badge` de cada status calculado pelo backend; o rótulo vem do dicionário. */
const STATUS_VARIANTS = {
  new: 'info',
  learning: 'warning',
  difficult: 'danger',
  mature: 'success',
  reviewing: 'neutral',
  suspended: 'neutral',
}

function statusBadge(status, labels) {
  return {
    variant: STATUS_VARIANTS[status] ?? 'neutral',
    label: labels[status] ?? status,
  }
}

/** Rótulo curto da próxima revisão de um card — "hoje"/"amanhã"/"em Nd"/"—". */
function formatNextReview(dueAt, now) {
  const { nextReview } = getTranslations().deckDetail

  if (dueAt === null) {
    return nextReview.none
  }

  const diffDays = Math.ceil((new Date(dueAt).getTime() - now.getTime()) / 86_400_000)

  if (diffDays <= 0) {
    return nextReview.today
  }

  if (diffDays === 1) {
    return nextReview.tomorrow
  }

  return nextReview.inDays(diffDays)
}

/** `ApiError` de posse/existência: o backend distingue os dois casos, a tela não. */
function isUnavailable(error) {
  return error instanceof ApiError && (error.status === 403 || error.status === 404)
}

/** "criado em <mês> de <ano>", a partir de `createdAt`, no locale do idioma ativo. */
function formatCreatedMonth(createdAt, language) {
  return new Intl.DateTimeFormat(localeForLanguage(language), {
    month: 'long',
    year: 'numeric',
  }).format(new Date(createdAt))
}

/** Formulário de nome/idiomas — reaproveitado para editar o baralho. */
function DeckEditForm({ deck, onSaved, onCancel }) {
  const t = useTranslations()

  const submit = useCallback(
    async (values) => {
      onSaved(await updateDeck(deck.id, values))
    },
    [deck.id, onSaved],
  )

  const validate = useCallback(
    (values) =>
      collect({
        name: requiredText(values.name, t.deckDetail.edit.nameRequiredLabel),
        sourceLanguage: requiredText(values.sourceLanguage, t.deckDetail.edit.sourceLanguageRequiredLabel),
        targetLanguage: requiredText(values.targetLanguage, t.deckDetail.edit.targetLanguageRequiredLabel),
      }),
    [t],
  )

  const { values, change, fieldErrors, generalError, submitting, handleSubmit } = useAuthForm({
    initialValues: {
      name: deck.name,
      sourceLanguage: deck.sourceLanguage,
      targetLanguage: deck.targetLanguage,
    },
    validate,
    submit,
    describeError: describeApiError(t.deckDetail.edit.genericError),
  })

  return (
    <form className="deck-form" onSubmit={handleSubmit} noValidate>
      {generalError && <Alert variant={generalError.variant}>{generalError.message}</Alert>}

      <Input
        label={t.deckDetail.edit.nameLabel}
        name="name"
        value={values.name}
        onChange={change('name')}
        error={fieldErrors.name}
        disabled={submitting}
      />
      <Input
        label={t.deckDetail.edit.sourceLanguageLabel}
        name="sourceLanguage"
        value={values.sourceLanguage}
        onChange={change('sourceLanguage')}
        error={fieldErrors.sourceLanguage}
        disabled={submitting}
      />
      <Input
        label={t.deckDetail.edit.targetLanguageLabel}
        name="targetLanguage"
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
          {submitting ? t.common.saving : t.common.save}
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
  const t = useTranslations()

  return (
    <div className="deck-detail__stats">
      <StatTile label={t.deckDetail.stats.new} value={deck.newCount ?? 0} />
      <StatTile label={t.deckDetail.stats.learning} value={deck.learningCount ?? 0} />
      <StatTile label={t.deckDetail.stats.mature} value={deck.matureCount ?? 0} />
      <StatTile label={t.deckDetail.stats.suspended} value={deck.suspendedCount ?? 0} />
    </div>
  )
}

/** Cabeçalho do baralho: exibição, edição, exclusão e início de revisão. */
function DeckHeader({ deck, reviewCount, onUpdated, onDeleted }) {
  const t = useTranslations()
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
      setDeleteError(error instanceof ApiError ? error.message : t.deckDetail.deleteError)
    } finally {
      setDeleting(false)
    }
  }, [deck.id, onDeleted, t])

  if (editing) {
    return (
      <Card title={t.deckDetail.edit.title}>
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
            {t.deckDetail.editAction}
          </Button>
          <ConfirmDeleteButton onConfirm={handleDelete} pending={deleting}>
            {t.deckDetail.deleteDeck}
          </ConfirmDeleteButton>
        </>
      }
    >
      {deleteError && <Alert variant="danger">{deleteError}</Alert>}

      <p className="deck-detail__meta">
        {t.deckDetail.cardsCount(deck.cardCount ?? 0)} · {deck.sourceLanguage} →{' '}
        {deck.targetLanguage} ·{' '}
        {t.deckDetail.createdIn(formatCreatedMonth(deck.createdAt, getLanguage()))}
      </p>

      <div className="deck-detail__review-cta">
        {reviewCount !== null && (
          <span className="deck-detail__review-count">
            {t.deckDetail.readyForReview(reviewCount)}
          </span>
        )}
        <Link
          to={`/baralhos/${deck.id}/revisar`}
          className="ms-button ms-button--primary ms-button--md"
        >
          {t.deckDetail.review}
        </Link>
      </div>
    </Card>
  )
}

/** Formulário de edição de um card existente. */
function CardEditForm({ card, onSaved, onCancel }) {
  const t = useTranslations()

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
    describeError: describeApiError(t.deckDetail.cardEditForm.genericError),
  })

  return (
    <form className="deck-form" onSubmit={handleSubmit} noValidate>
      {generalError && <Alert variant={generalError.variant}>{generalError.message}</Alert>}

      <CardFields values={values} change={change} fieldErrors={fieldErrors} disabled={submitting} />

      <div className="deck-form__actions">
        <Button variant="ghost" type="button" disabled={submitting} onClick={onCancel}>
          {t.common.cancel}
        </Button>
        <Button type="submit" loading={submitting}>
          {submitting ? t.common.saving : t.common.save}
        </Button>
      </div>
    </form>
  )
}

/** Um card na lista: exibição, edição, exclusão e suspensão. */
function CardItem({ card, now, onUpdated, onDeleted, onSuspendToggled }) {
  const t = useTranslations()
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
      setDeleteError(error instanceof ApiError ? error.message : t.deckDetail.cardItem.deleteError)
    } finally {
      setDeleting(false)
    }
  }, [card.id, onDeleted, t])

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
          : card.suspended
            ? t.deckDetail.cardItem.reactivateError
            : t.deckDetail.cardItem.suspendError,
      )
    } finally {
      setSuspending(false)
    }
  }, [card.id, card.suspended, onSuspendToggled, t])

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

  const badge = statusBadge(card.status, t.deckDetail.statusBadges)

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
            {t.deckDetail.cardItem.editAction}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            loading={suspending}
            onClick={handleSuspendToggle}
          >
            {card.suspended ? t.deckDetail.cardItem.reactivate : t.deckDetail.cardItem.suspend}
          </Button>
          <ConfirmDeleteButton onConfirm={handleDelete} pending={deleting} />
        </div>
      </div>

      {(card.partOfSpeech || card.synonyms?.length > 0) && (
        <p className="deck-detail__card-detail">
          {card.partOfSpeech}
          {card.partOfSpeech && card.synonyms?.length > 0 ? ' · ' : ''}
          {card.synonyms?.length > 0 &&
            t.deckDetail.cardItem.synonymsPrefix(card.synonyms.join(', '))}
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
  const t = useTranslations()

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

  const statusFilterOptions = [
    { value: '', label: t.deckDetail.statusFilterOptions.all },
    { value: 'new', label: t.deckDetail.statusFilterOptions.new },
    { value: 'learning', label: t.deckDetail.statusFilterOptions.learning },
    { value: 'difficult', label: t.deckDetail.statusFilterOptions.difficult },
    { value: 'mature', label: t.deckDetail.statusFilterOptions.mature },
    { value: 'reviewing', label: t.deckDetail.statusFilterOptions.reviewing },
    { value: 'suspended', label: t.deckDetail.statusFilterOptions.suspended },
  ]

  const loadDeck = useCallback(async () => {
    setDeckStatus('loading')

    try {
      setDeck(await getDeck(id))
      setDeckStatus('ok')
    } catch (error) {
      setDeckError(
        isUnavailable(error)
          ? t.deckDetail.unavailable
          : error instanceof ApiError
            ? error.message
            : t.deckDetail.loadError,
      )
      setDeckStatus('error')
    }
  }, [id, t])

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
          {t.deckDetail.backToDecks}
        </Link>
        <div className="deck-detail__loading">
          <Spinner label={t.deckDetail.loadingDeck} />
        </div>
      </div>
    )
  }

  if (deckStatus === 'error') {
    return (
      <Card title={t.deckDetail.unavailableTitle}>
        <Alert variant="danger">{deckError}</Alert>
        <p>
          <Link to="/">{t.deckDetail.backToDecksLink}</Link>
        </p>
      </Card>
    )
  }

  // Excluir muda quantos cards existem e, por tabela, quantas páginas há —
  // recarregar a página atual do servidor (a mesma técnica de `reload()`
  // documentada no design.md) evita que a lista em memória fique com mais
  // ou menos itens do que o tamanho de página permite. Criar um card agora
  // acontece em `AddCardPage`, que já volta para cá navegando — a tela
  // recarrega do zero, sem precisar de um retorno explícito aqui.
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
        {t.deckDetail.backToDecks}
      </Link>

      <DeckHeader
        deck={deck}
        reviewCount={reviewCount}
        onUpdated={setDeck}
        onDeleted={() => navigate('/', { replace: true })}
      />

      <DeckStats deck={deck} />

      <Card
        title={t.deckDetail.cardsCard.title}
        actions={
          <Link
            className="ms-button ms-button--primary ms-button--sm"
            to={`/baralhos/${id}/cards/novo`}
          >
            {t.deckDetail.cardsCard.addCard}
          </Link>
        }
      >
        <div className="deck-detail__filters">
          <Input
            label={t.deckDetail.cardsCard.searchLabel}
            name="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t.deckDetail.cardsCard.searchPlaceholder}
          />

          <div className="ms-field">
            <label className="ms-field__label" htmlFor="deck-detail-status-filter">
              {t.deckDetail.cardsCard.statusLabel}
            </label>
            <select
              id="deck-detail-status-filter"
              className="ms-field__control"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {statusFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {cardsStatus === 'loading' && (
          <div className="deck-detail__loading">
            <Spinner label={t.deckDetail.cardsCard.loading} />
          </div>
        )}

        {cardsStatus === 'error' && (
          <Alert variant="danger">{t.deckDetail.cardsCard.loadError}</Alert>
        )}

        {cardsStatus === 'ok' && cards.length === 0 && (
          <p className="deck-detail__empty">
            {isFiltering
              ? t.deckDetail.cardsCard.emptyFiltered
              : t.deckDetail.cardsCard.emptyUnfiltered}
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
    </div>
  )
}
