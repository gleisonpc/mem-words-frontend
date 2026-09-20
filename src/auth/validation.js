import { getTranslations } from '../i18n/useTranslations'

/**
 * Validação no cliente, espelhando as regras que o backend aplica.
 *
 * Serve para dar resposta imediata e evitar uma ida ao servidor por um campo
 * vazio — não para ser a garantia. A recusa do backend continua sendo a
 * palavra final, e as mensagens aqui repetem as dele para que a mesma falha
 * não seja descrita de duas formas diferentes.
 */

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export const NAME_MIN = 2
export const NAME_MAX = 120
export const EMAIL_MAX = 255
export const PASSWORD_MIN = 8
/** O bcrypt trunca em 72 bytes, então o backend recusa acima disso. */
export const PASSWORD_MAX = 72

export function validateName(value) {
  const name = value.trim()
  const { validation } = getTranslations().auth

  if (name === '') {
    return validation.nameRequired
  }

  if (name.length < NAME_MIN) {
    return validation.nameMin(NAME_MIN)
  }

  if (name.length > NAME_MAX) {
    return validation.nameMax(NAME_MAX)
  }

  return null
}

export function validateEmail(value) {
  const email = value.trim()
  const { validation } = getTranslations().auth

  if (email === '') {
    return validation.emailRequired
  }

  if (!EMAIL_PATTERN.test(email)) {
    return validation.emailInvalid
  }

  if (email.length > EMAIL_MAX) {
    return validation.emailMax
  }

  return null
}

/** Senha do cadastro: regras de tamanho do backend. */
export function validateNewPassword(value) {
  const { validation } = getTranslations().auth

  if (value === '') {
    return validation.newPasswordRequired
  }

  if (value.length < PASSWORD_MIN) {
    return validation.passwordMin(PASSWORD_MIN)
  }

  if (value.length > PASSWORD_MAX) {
    return validation.passwordMax(PASSWORD_MAX)
  }

  return null
}

/**
 * Senha da entrada: só presença.
 *
 * Validar tamanho aqui não ajudaria em nada e daria uma pista sobre a senha
 * real — é a mesma razão pela qual o backend também não valida força no login.
 */
export function validateCurrentPassword(value) {
  return value === '' ? getTranslations().auth.validation.currentPasswordRequired : null
}

/** Descarta chaves sem mensagem, para que o mapa vazio signifique "válido". */
export function collect(candidates) {
  return Object.fromEntries(Object.entries(candidates).filter(([, message]) => message !== null))
}
