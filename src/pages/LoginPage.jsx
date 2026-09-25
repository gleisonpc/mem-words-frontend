import { useCallback, useState } from 'react'
import { Link, useLocation } from 'react-router'
import ApiError from '../api/ApiError'
import GoogleSignInButton from '../auth/GoogleSignInButton'
import useAuth from '../auth/useAuth'
import useAuthForm from '../auth/useAuthForm'
import { collect, validateCurrentPassword, validateEmail } from '../auth/validation'
import { Alert, Button, Input } from '../components/ui'
import { GOOGLE_CLIENT_ID } from '../config'
import useTranslations from '../i18n/useTranslations'
import AuthScreen from './AuthScreen'

function validate(values) {
  return collect({
    email: validateEmail(values.email),
    password: validateCurrentPassword(values.password),
  })
}

export default function LoginPage() {
  const { signIn, signInWithGoogle, notice, dismissNotice } = useAuth()
  const location = useLocation()
  const t = useTranslations()

  // Não há navegação aqui: autenticado, o `GuestOnly` que envolve esta rota
  // leva ao destino pretendido — um único lugar decidindo para onde ir.
  const submit = useCallback(
    async ({ email, password }) => {
      // O aviso de sessão expirada sai daqui: a partir do envio, o que
      // interessa é o resultado desta tentativa.
      dismissNotice()
      await signIn({ email, password })
    },
    [dismissNotice, signIn],
  )

  const { values, change, fieldErrors, generalError, submitting, handleSubmit } = useAuthForm({
    initialValues: { email: '', password: '' },
    validate,
    submit,
  })

  // Erro próprio do fluxo do Google: separado do erro do formulário de
  // credenciais (que `useAuthForm` já controla), mas exibido pelo mesmo
  // mecanismo de `Alert` — nunca marca campos do formulário como inválidos.
  const [googleError, setGoogleError] = useState(null)

  const handleGoogleSuccess = useCallback(
    async (idToken) => {
      dismissNotice()
      setGoogleError(null)

      try {
        await signInWithGoogle(idToken)
      } catch (error) {
        setGoogleError({
          variant: 'danger',
          message: error instanceof ApiError ? error.message : t.auth.google.unavailable,
        })
      }
    },
    [dismissNotice, signInWithGoogle, t],
  )

  const handleGoogleError = useCallback(() => {
    setGoogleError({ variant: 'danger', message: t.auth.google.unavailable })
  }, [t])

  return (
    <AuthScreen
      title={t.auth.login.title}
      footer={
        <>
          {t.auth.login.noAccount}{' '}
          {/* O destino pretendido viaja junto: quem foi desviado para cá e
              decide criar conta continua indo para onde queria. */}
          <Link to="/cadastro" state={location.state}>
            {t.auth.login.createAccount}
          </Link>
        </>
      }
    >
      {/* Aviso do que aconteceu fora desta tela: sessão expirada, sessão não
          confirmada por falta de backend. Sai de cena no primeiro envio. */}
      {notice && <Alert variant={notice.variant}>{notice.message}</Alert>}

      {generalError && <Alert variant={generalError.variant}>{generalError.message}</Alert>}
      {googleError && <Alert variant={googleError.variant}>{googleError.message}</Alert>}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <Input
          label={t.auth.fields.email}
          type="email"
          name="email"
          autoComplete="email"
          autoFocus
          value={values.email}
          onChange={change('email')}
          error={fieldErrors.email}
          disabled={submitting}
        />

        <Input
          label={t.auth.fields.password}
          type="password"
          name="password"
          autoComplete="current-password"
          value={values.password}
          onChange={change('password')}
          error={fieldErrors.password}
          disabled={submitting}
        />

        <div className="auth-form__actions">
          {/* `type="submit"` é o que permite enviar pelo Enter, sem clique. */}
          <Button type="submit" loading={submitting}>
            {submitting ? t.auth.login.submitting : t.auth.login.submit}
          </Button>
        </div>
      </form>

      {GOOGLE_CLIENT_ID !== '' && (
        <>
          <div className="auth-form__divider">{t.auth.google.orDivider}</div>
          <GoogleSignInButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
        </>
      )}
    </AuthScreen>
  )
}
