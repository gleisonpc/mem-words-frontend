import { createContext } from 'react'

/**
 * Peças compartilhadas da sessão que não são componentes.
 *
 * Ficam fora de `AuthProvider.jsx` porque um arquivo que exporta componentes
 * e não-componentes quebra a atualização rápida do Vite em desenvolvimento.
 */

/** Ainda não se sabe se a sessão guardada é válida. */
export const DETERMINING = 'determining'
/** Há sessão confirmada pelo backend. */
export const AUTHENTICATED = 'authenticated'
/** Não há sessão. */
export const ANONYMOUS = 'anonymous'

export const AuthContext = createContext(null)

/**
 * Erro do cadastro cuja conta **foi** criada, mas cuja entrada seguinte
 * falhou. Repetir o cadastro devolveria `409` e deixaria a pessoa sem
 * entender por quê, então a tela precisa saber diferenciar este caso.
 */
export class AccountCreatedError extends Error {
  constructor(cause) {
    super(
      'Sua conta foi criada, mas não foi possível entrar automaticamente. Use seus dados para entrar.',
    )
    this.name = 'AccountCreatedError'
    this.cause = cause
  }
}
