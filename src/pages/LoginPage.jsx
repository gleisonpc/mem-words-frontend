import { useCallback } from 'react'
import { Link, useLocation } from 'react-router'
import useAuth from '../auth/useAuth'
import useAuthForm from '../auth/useAuthForm'
import { collect, validateCurrentPassword, validateEmail } from '../auth/validation'
import { Alert, Button, Input } from '../components/ui'
import AuthScreen from './AuthScreen'

function validate(values) {
  return collect({
    email: validateEmail(values.email),
    password: validateCurrentPassword(values.password),
  })
}

export default function LoginPage() {
  const { signIn, notice, dismissNotice } = useAuth()
  const location = useLocation()

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

  return (
    <AuthScreen
      title="Entrar"
      footer={
        <>
          Ainda não tem conta?{' '}
          {/* O destino pretendido viaja junto: quem foi desviado para cá e
              decide criar conta continua indo para onde queria. */}
          <Link to="/cadastro" state={location.state}>
            Criar uma conta
          </Link>
        </>
      }
    >
      {/* Aviso do que aconteceu fora desta tela: sessão expirada, sessão não
          confirmada por falta de backend. Sai de cena no primeiro envio. */}
      {notice && <Alert variant={notice.variant}>{notice.message}</Alert>}

      {generalError && <Alert variant={generalError.variant}>{generalError.message}</Alert>}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <Input
          label="E-mail"
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
          label="Senha"
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
            {submitting ? 'Entrando...' : 'Entrar'}
          </Button>
        </div>
      </form>
    </AuthScreen>
  )
}
