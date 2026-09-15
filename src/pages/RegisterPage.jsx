import { useCallback } from 'react'
import { Link, useLocation } from 'react-router'
import { AccountCreatedError } from '../auth/session'
import useAuth from '../auth/useAuth'
import useAuthForm from '../auth/useAuthForm'
import { collect, validateEmail, validateName, validateNewPassword } from '../auth/validation'
import { Alert, Button, Input } from '../components/ui'
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

  return { variant: 'danger', message: error.message ?? 'Não foi possível criar sua conta.' }
}

export default function RegisterPage() {
  const { signUp, notice } = useAuth()
  const location = useLocation()

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
      title="Criar conta"
      footer={
        <>
          Já tem conta?{' '}
          <Link to="/entrar" state={location.state}>
            Entrar
          </Link>
        </>
      }
    >
      {notice && <Alert variant={notice.variant}>{notice.message}</Alert>}

      {generalError && <Alert variant={generalError.variant}>{generalError.message}</Alert>}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <Input
          label="Nome"
          name="name"
          autoComplete="name"
          autoFocus
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

        <Input
          label="Senha"
          type="password"
          name="password"
          autoComplete="new-password"
          help="Ao menos 8 caracteres."
          value={values.password}
          onChange={change('password')}
          error={fieldErrors.password}
          disabled={submitting}
        />

        <div className="auth-form__actions">
          <Button type="submit" loading={submitting}>
            {submitting ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </div>
      </form>
    </AuthScreen>
  )
}
