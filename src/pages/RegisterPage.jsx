import { useCallback } from 'react'
import { Link, useLocation } from 'react-router'
import { AccountCreatedError } from '../auth/session'
import useAuth from '../auth/useAuth'
import useAuthForm from '../auth/useAuthForm'
import { collect, validateEmail, validateName, validateNewPassword } from '../auth/validation'
import { Alert, Button, Input } from '../components/ui'
import useTranslations, { getTranslations } from '../i18n/useTranslations'
import AuthScreen from './AuthScreen'

function validate(values) {
  return collect({
    name: validateName(values.name),
    email: validateEmail(values.email),
    password: validateNewPassword(values.password),
  })
}

/**
 * A conta criada sem sessão é o único caso em que a falha traz boa notícia:
 * insistir no cadastro devolveria `409`, então a tela manda entrar.
 */
function describeError(error) {
  if (error instanceof AccountCreatedError) {
    return { variant: 'warning', message: error.message }
  }

  return { variant: 'danger', message: error.message ?? getTranslations().auth.register.genericError }
}

export default function RegisterPage() {
  const { signUp, notice } = useAuth()
  const location = useLocation()
  const t = useTranslations()

  // Como na entrada, quem navega depois do sucesso é o `GuestOnly`.
  const submit = useCallback(async (values) => signUp(values), [signUp])

  const { values, change, fieldErrors, generalError, submitting, handleSubmit } = useAuthForm({
    initialValues: { name: '', email: '', password: '' },
    validate,
    submit,
    describeError,
  })

  return (
    <AuthScreen
      title={t.auth.register.title}
      footer={
        <>
          {t.auth.register.hasAccount}{' '}
          <Link to="/entrar" state={location.state}>
            {t.auth.register.signIn}
          </Link>
        </>
      }
    >
      {notice && <Alert variant={notice.variant}>{notice.message}</Alert>}

      {generalError && <Alert variant={generalError.variant}>{generalError.message}</Alert>}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <Input
          label={t.auth.fields.name}
          name="name"
          autoComplete="name"
          autoFocus
          value={values.name}
          onChange={change('name')}
          error={fieldErrors.name}
          disabled={submitting}
        />

        <Input
          label={t.auth.fields.email}
          type="email"
          name="email"
          autoComplete="email"
          value={values.email}
          onChange={change('email')}
          error={fieldErrors.email}
          disabled={submitting}
        />

        <Input
          label={t.auth.fields.password}
          type="password"
          name="password"
          autoComplete="new-password"
          help={t.auth.register.passwordHelp}
          value={values.password}
          onChange={change('password')}
          error={fieldErrors.password}
          disabled={submitting}
        />

        <div className="auth-form__actions">
          <Button type="submit" loading={submitting}>
            {submitting ? t.auth.register.submitting : t.auth.register.submit}
          </Button>
        </div>
      </form>
    </AuthScreen>
  )
}
