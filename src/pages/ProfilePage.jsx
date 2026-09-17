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
import { getTheme, setTheme } from '../theme'
import { Alert, Button, Card, Input } from '../components/ui'
import './ProfilePage.css'

const THEME_OPTIONS = [
  { value: 'system', label: 'Do sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
]

/** Seletor de tema: aplica na hora, sem precisar salvar. */
function ThemeSelector() {
  const [theme, setThemeState] = useState(getTheme)

  return (
    <Card title="Tema">
      <div className="profile-theme">
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

function describeError(fallback) {
  return (error) => ({
    variant: 'danger',
    message: error instanceof ApiError ? error.message : fallback,
  })
}

/** Formulário de nome e e-mail. */
function AccountForm({ user, updateProfile }) {
  const [successMessage, setSuccessMessage] = useState(null)

  const submit = useCallback(
    async (values) => {
      setSuccessMessage(null)
      await updateProfile({ name: values.name, email: values.email })
      setSuccessMessage('Dados atualizados.')
    },
    [updateProfile],
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
    describeError: describeError('Não foi possível salvar seus dados.'),
  })

  return (
    <Card title="Conta">
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {generalError && <Alert variant={generalError.variant}>{generalError.message}</Alert>}

      <form className="profile-form" onSubmit={handleSubmit} noValidate>
        <Input
          label="Nome"
          name="name"
          autoComplete="name"
          value={values.name}
          onChange={change('name')}
          error={fieldErrors.name}
          disabled={submitting}
        />

        <Input
          label="E-mail"
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
            {submitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

/** Formulário de troca de senha, revelado sob demanda. */
function PasswordForm({ updateProfile, onDone, onCancel }) {
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
    describeError: describeError('Não foi possível trocar a senha.'),
  })

  return (
    <form className="profile-form" onSubmit={handleSubmit} noValidate>
      {generalError && <Alert variant={generalError.variant}>{generalError.message}</Alert>}

      <Input
        label="Senha atual"
        type="password"
        name="currentPassword"
        autoComplete="current-password"
        value={values.currentPassword}
        onChange={change('currentPassword')}
        error={fieldErrors.currentPassword}
        disabled={submitting}
      />

      <Input
        label="Nova senha"
        type="password"
        name="password"
        autoComplete="new-password"
        help="Ao menos 8 caracteres."
        value={values.password}
        onChange={change('password')}
        error={fieldErrors.password}
        disabled={submitting}
      />

      <div className="profile-form__actions">
        <Button variant="ghost" type="button" disabled={submitting} onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={submitting}>
          {submitting ? 'Salvando...' : 'Salvar senha'}
        </Button>
      </div>
    </form>
  )
}

/** Tela de perfil: editar nome/e-mail e trocar a senha. */
export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(null)

  return (
    <div className="profile">
      <AccountForm user={user} updateProfile={updateProfile} />

      <ThemeSelector />

      <Card title="Senha">
        {passwordSuccess && !changingPassword && <Alert variant="success">{passwordSuccess}</Alert>}

        {changingPassword ? (
          <PasswordForm
            updateProfile={updateProfile}
            onDone={() => {
              setChangingPassword(false)
              setPasswordSuccess('Senha alterada.')
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
            Trocar senha
          </Button>
        )}
      </Card>
    </div>
  )
}
