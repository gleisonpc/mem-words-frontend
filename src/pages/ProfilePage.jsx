import { useCallback, useState } from 'react'
import useAuth from '../auth/useAuth'
import useAuthForm from '../auth/useAuthForm'
import {
  collect,
  validateCurrentPassword,
  validateEmail,
  validateName,
  validateNewPassword,
} from '../auth/validation'
import ApiError from '../api/ApiError'
import { getLanguage, setLanguage } from '../i18n/language'
import useTranslations from '../i18n/useTranslations'
import { getTheme, setTheme } from '../theme'
import { Alert, Button, Card, Input } from '../components/ui'
import './ProfilePage.css'

/** Seletor de tema: aplica na hora, sem precisar salvar. */
function ThemeSelector() {
  const t = useTranslations()
  const [theme, setThemeState] = useState(getTheme)

  const THEME_OPTIONS = [
    { value: 'system', label: t.profile.theme.system },
    { value: 'light', label: t.profile.theme.light },
    { value: 'dark', label: t.profile.theme.dark },
  ]

  return (
    <Card title={t.profile.theme.title}>
      <div className="profile-options">
        {THEME_OPTIONS.map(({ value, label }) => (
          <Button
            key={value}
            type="button"
            variant={theme === value ? 'primary' : 'secondary'}
            aria-pressed={theme === value}
            onClick={() => {
              setTheme(value)
              setThemeState(value)
            }}
          >
            {label}
          </Button>
        ))}
      </div>
    </Card>
  )
}

/** Seletor de idioma da interface: aplica na hora, sem precisar salvar. */
function LanguageSelector() {
  const t = useTranslations()
  const [language, setLanguageState] = useState(getLanguage)

  const LANGUAGE_OPTIONS = [
    { value: 'pt', label: t.profile.language.portuguese },
    { value: 'en', label: t.profile.language.english },
  ]

  return (
    <Card title={t.profile.language.title}>
      <div className="profile-options">
        {LANGUAGE_OPTIONS.map(({ value, label }) => (
          <Button
            key={value}
            type="button"
            variant={language === value ? 'primary' : 'secondary'}
            aria-pressed={language === value}
            onClick={() => {
              setLanguage(value)
              setLanguageState(value)
            }}
          >
            {label}
          </Button>
        ))}
      </div>
    </Card>
  )
}

function describeError(fallback) {
  return (error) => ({
    variant: 'danger',
    message: error instanceof ApiError ? error.message : fallback,
  })
}

/** Formulário de nome e e-mail. */
function AccountForm({ user, updateProfile }) {
  const t = useTranslations()
  const [successMessage, setSuccessMessage] = useState(null)

  const submit = useCallback(
    async (values) => {
      setSuccessMessage(null)
      await updateProfile({ name: values.name, email: values.email })
      setSuccessMessage(t.profile.accountCard.savedMessage)
    },
    [updateProfile, t],
  )

  const validate = useCallback(
    (values) =>
      collect({
        name: validateName(values.name),
        email: validateEmail(values.email),
      }),
    [],
  )

  const { values, change, fieldErrors, generalError, submitting, handleSubmit } = useAuthForm({
    initialValues: { name: user.name, email: user.email },
    validate,
    submit,
    describeError: describeError(t.profile.accountCard.genericError),
  })

  return (
    <Card title={t.profile.accountCard.title}>
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {generalError && <Alert variant={generalError.variant}>{generalError.message}</Alert>}

      <form className="profile-form" onSubmit={handleSubmit} noValidate>
        <Input
          label={t.profile.accountCard.nameLabel}
          name="name"
          autoComplete="name"
          value={values.name}
          onChange={change('name')}
          error={fieldErrors.name}
          disabled={submitting}
        />

        <Input
          label={t.profile.accountCard.emailLabel}
          type="email"
          name="email"
          autoComplete="email"
          value={values.email}
          onChange={change('email')}
          error={fieldErrors.email}
          disabled={submitting}
        />

        <div className="profile-form__actions">
          <Button type="submit" loading={submitting}>
            {submitting ? t.common.saving : t.common.save}
          </Button>
        </div>
      </form>
    </Card>
  )
}

/** Formulário de exclusão de conta, revelado sob demanda. */
function DeleteAccountForm({ deleteAccount, onCancel }) {
  const t = useTranslations()

  const submit = useCallback(
    async (values) => {
      await deleteAccount(values.currentPassword)
    },
    [deleteAccount],
  )

  const validate = useCallback(
    (values) => collect({ currentPassword: validateCurrentPassword(values.currentPassword) }),
    [],
  )

  const { values, change, fieldErrors, generalError, submitting, handleSubmit } = useAuthForm({
    initialValues: { currentPassword: '' },
    validate,
    submit,
    describeError: describeError(t.profile.deleteAccount.genericError),
  })

  return (
    <form className="profile-form" onSubmit={handleSubmit} noValidate>
      <Alert variant="warning">{t.profile.deleteAccount.warning}</Alert>
      {generalError && <Alert variant={generalError.variant}>{generalError.message}</Alert>}

      <Input
        label={t.profile.deleteAccount.currentPasswordLabel}
        type="password"
        name="currentPassword"
        autoComplete="current-password"
        value={values.currentPassword}
        onChange={change('currentPassword')}
        error={fieldErrors.currentPassword}
        disabled={submitting}
      />

      <div className="profile-form__actions">
        <Button variant="ghost" type="button" disabled={submitting} onClick={onCancel}>
          {t.common.cancel}
        </Button>
        <Button variant="danger" type="submit" loading={submitting}>
          {submitting ? t.profile.deleteAccount.deleting : t.profile.deleteAccount.deleteButton}
        </Button>
      </div>
    </form>
  )
}

/** Formulário de troca de senha, revelado sob demanda. */
function PasswordForm({ updateProfile, onDone, onCancel }) {
  const t = useTranslations()

  const submit = useCallback(
    async (values) => {
      await updateProfile({ password: values.password, currentPassword: values.currentPassword })
      onDone()
    },
    [updateProfile, onDone],
  )

  const validate = useCallback(
    (values) =>
      collect({
        currentPassword: validateCurrentPassword(values.currentPassword),
        password: validateNewPassword(values.password),
      }),
    [],
  )

  const { values, change, fieldErrors, generalError, submitting, handleSubmit } = useAuthForm({
    initialValues: { currentPassword: '', password: '' },
    validate,
    submit,
    describeError: describeError(t.profile.password.genericError),
  })

  return (
    <form className="profile-form" onSubmit={handleSubmit} noValidate>
      {generalError && <Alert variant={generalError.variant}>{generalError.message}</Alert>}

      <Input
        label={t.profile.password.currentPasswordLabel}
        type="password"
        name="currentPassword"
        autoComplete="current-password"
        value={values.currentPassword}
        onChange={change('currentPassword')}
        error={fieldErrors.currentPassword}
        disabled={submitting}
      />

      <Input
        label={t.profile.password.newPasswordLabel}
        type="password"
        name="password"
        autoComplete="new-password"
        help={t.profile.password.newPasswordHelp}
        value={values.password}
        onChange={change('password')}
        error={fieldErrors.password}
        disabled={submitting}
      />

      <div className="profile-form__actions">
        <Button variant="ghost" type="button" disabled={submitting} onClick={onCancel}>
          {t.common.cancel}
        </Button>
        <Button type="submit" loading={submitting}>
          {submitting ? t.common.saving : t.profile.password.saveButton}
        </Button>
      </div>
    </form>
  )
}

/** Tela de perfil: editar nome/e-mail, trocar a senha, excluir a conta. */
export default function ProfilePage() {
  const { user, updateProfile, deleteAccount } = useAuth()
  const t = useTranslations()
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(null)
  const [deletingAccount, setDeletingAccount] = useState(false)

  return (
    <div className="profile">
      <AccountForm user={user} updateProfile={updateProfile} />

      <ThemeSelector />

      <LanguageSelector />

      <Card title={t.profile.password.cardTitle}>
        {passwordSuccess && !changingPassword && <Alert variant="success">{passwordSuccess}</Alert>}

        {changingPassword ? (
          <PasswordForm
            updateProfile={updateProfile}
            onDone={() => {
              setChangingPassword(false)
              setPasswordSuccess(t.profile.password.changedMessage)
            }}
            onCancel={() => setChangingPassword(false)}
          />
        ) : (
          <Button
            variant="secondary"
            onClick={() => {
              setPasswordSuccess(null)
              setChangingPassword(true)
            }}
          >
            {t.profile.password.changeButton}
          </Button>
        )}
      </Card>

      <Card title={t.profile.deleteAccount.cardTitle}>
        {deletingAccount ? (
          <DeleteAccountForm deleteAccount={deleteAccount} onCancel={() => setDeletingAccount(false)} />
        ) : (
          <Button variant="danger" onClick={() => setDeletingAccount(true)}>
            {t.profile.deleteAccount.deleteButton}
          </Button>
        )}
      </Card>
    </div>
  )
}
