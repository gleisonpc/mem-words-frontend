import { useState } from 'react'
import useTranslations from '../i18n/useTranslations'
import {
  Alert,
  Badge,
  Button,
  Card,
  ConfirmDeleteButton,
  Input,
  Pagination,
  ProgressBar,
  Spinner,
} from './ui'
import './Gallery.css'

const VARIANTS = ['primary', 'secondary', 'ghost', 'danger']
const STATES = ['neutral', 'success', 'warning', 'danger', 'info']

function Section({ id, title, description, children }) {
  return (
    <section className="gal-section" aria-labelledby={id}>
      <h2 className="gal-section__title" id={id}>
        {title}
      </h2>
      {description && <p className="gal-section__description">{description}</p>}
      <div className="gal-section__body">{children}</div>
    </section>
  )
}

export default function Gallery() {
  const t = useTranslations()
  const [cliques, setCliques] = useState(0)
  const [progresso, setProgresso] = useState(40)
  const [pagina, setPagina] = useState(1)

  /** Tokens semânticos exibidos na paleta, na ordem em que fazem sentido lidos. */
  const swatches = [
    ['--color-bg', t.gallery.palette.roles.bg],
    ['--color-surface', t.gallery.palette.roles.surface],
    ['--color-surface-muted', t.gallery.palette.roles.surfaceMuted],
    ['--color-border', t.gallery.palette.roles.border],
    ['--color-border-strong', t.gallery.palette.roles.borderStrong],
    ['--color-text', t.gallery.palette.roles.text],
    ['--color-text-muted', t.gallery.palette.roles.textMuted],
    ['--color-primary', t.gallery.palette.roles.primary],
    ['--color-primary-hover', t.gallery.palette.roles.primaryHover],
    ['--color-on-primary', t.gallery.palette.roles.onPrimary],
    ['--color-success', t.gallery.palette.roles.success],
    ['--color-success-bg', t.gallery.palette.roles.successBg],
    ['--color-warning', t.gallery.palette.roles.warning],
    ['--color-warning-bg', t.gallery.palette.roles.warningBg],
    ['--color-danger', t.gallery.palette.roles.danger],
    ['--color-danger-bg', t.gallery.palette.roles.dangerBg],
    ['--color-info', t.gallery.palette.roles.info],
    ['--color-info-bg', t.gallery.palette.roles.infoBg],
  ]

  return (
    <main className="gal">
      <header className="gal-header">
        <h1>{t.gallery.title}</h1>
        <p>{t.gallery.intro}</p>
      </header>

      <Section id="paleta" title={t.gallery.palette.title} description={t.gallery.palette.description}>
        <ul className="gal-swatches">
          {swatches.map(([token, papel]) => (
            <li className="gal-swatch" key={token}>
              <span className="gal-swatch__chip" style={{ background: `var(${token})` }} />
              <span className="gal-swatch__text">
                <code>{token}</code>
                <span className="gal-swatch__role">{papel}</span>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="botoes" title={t.gallery.buttons.title} description={t.gallery.buttons.description}>
        <div className="gal-row">
          {VARIANTS.map((v) => (
            <Button key={v} variant={v}>
              {v}
            </Button>
          ))}
        </div>
        <div className="gal-row">
          {VARIANTS.map((v) => (
            <Button key={v} variant={v} size="sm">
              {t.gallery.buttons.small(v)}
            </Button>
          ))}
        </div>
        <div className="gal-row">
          <Button disabled>{t.gallery.buttons.disabled}</Button>
          <Button variant="secondary" disabled>
            {t.gallery.buttons.disabled}
          </Button>
          <Button loading>{t.gallery.buttons.loading}</Button>
          <Button variant="secondary" loading>
            {t.gallery.buttons.loading}
          </Button>
        </div>
      </Section>

      <Section
        id="botao-carregando"
        title={t.gallery.loadingButton.title}
        description={t.gallery.loadingButton.description}
      >
        <div className="gal-row">
          <Button onClick={() => setCliques((n) => n + 1)}>{t.gallery.loadingButton.countClick}</Button>
          <Button loading onClick={() => setCliques((n) => n + 1)}>
            {t.gallery.loadingButton.countClickLoading}
          </Button>
          <output className="gal-output">
            {t.gallery.loadingButton.clicksCounted} <strong>{cliques}</strong>
          </output>
        </div>
      </Section>

      <Section id="campos" title={t.gallery.fields.title}>
        <div className="gal-grid">
          <Input label={t.gallery.fields.wordLabel} placeholder={t.gallery.fields.wordPlaceholder} />
          <Input
            label={t.gallery.fields.translationLabel}
            placeholder={t.gallery.fields.translationPlaceholder}
            help={t.gallery.fields.translationHelp}
          />
          <Input
            label={t.gallery.fields.wordLabel}
            defaultValue=""
            error={t.gallery.fields.wordError}
          />
          <Input
            label={t.gallery.fields.languageLabel}
            value={t.gallery.fields.languageValue}
            disabled
            readOnly
          />
        </div>
      </Section>

      <Section id="cartoes" title={t.gallery.cards.title}>
        <Card title={t.gallery.cards.basicTitle}>
          <p className="gal-text">{t.gallery.cards.basicBody}</p>
        </Card>
        <Card
          title={t.gallery.cards.withActionsTitle}
          actions={
            <Button size="sm" variant="ghost">
              {t.gallery.cards.withActionsAction}
            </Button>
          }
        >
          <p className="gal-text">{t.gallery.cards.withActionsBody}</p>
        </Card>
      </Section>

      <Section id="selos" title={t.gallery.badges.title}>
        <div className="gal-row">
          {STATES.map((v) => (
            <Badge key={v} variant={v}>
              {v}
            </Badge>
          ))}
        </div>
      </Section>

      <Section id="alertas" title={t.gallery.alerts.title}>
        <Alert variant="success" title={t.gallery.alerts.savedTitle}>
          {t.gallery.alerts.savedBody}
        </Alert>
        <Alert variant="info">{t.gallery.alerts.infoBody}</Alert>
        <Alert variant="warning" title={t.gallery.alerts.longSessionTitle}>
          {t.gallery.alerts.longSessionBody}
        </Alert>
        <Alert variant="danger" title={t.gallery.alerts.saveFailedTitle}>
          {t.gallery.alerts.saveFailedBody}
        </Alert>
      </Section>

      <Section id="carregamento" title={t.gallery.loadingIndicator.title}>
        <div className="gal-row gal-row--center">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
          <span className="gal-text">{t.gallery.loadingIndicator.description}</span>
        </div>
      </Section>

      <Section
        id="progresso"
        title={t.gallery.progress.title}
        description={t.gallery.progress.description}
      >
        <ProgressBar label={t.gallery.progress.sessionLabel} value={progresso} showValue />
        <div className="gal-row">
          <Button size="sm" variant="secondary" onClick={() => setProgresso((p) => p - 30)}>
            −30
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setProgresso((p) => p + 30)}>
            +30
          </Button>
          <output className="gal-output">
            {t.gallery.progress.rawValue} <strong>{progresso}</strong>
          </output>
        </div>
        <ProgressBar label={t.gallery.progress.belowMin} value={-50} showValue />
        <ProgressBar label={t.gallery.progress.aboveMax} value={150} showValue />
      </Section>

      <Section
        id="paginacao"
        title={t.gallery.pagination.title}
        description={t.gallery.pagination.description}
      >
        <Pagination page={pagina} pageSize={10} total={42} onChange={setPagina} />
      </Section>

      <Section
        id="excluir"
        title={t.gallery.deleteConfirm.title}
        description={t.gallery.deleteConfirm.description}
      >
        <ConfirmDeleteButton onConfirm={() => {}}>{t.gallery.deleteConfirm.deleteDeck}</ConfirmDeleteButton>
      </Section>
    </main>
  )
}
