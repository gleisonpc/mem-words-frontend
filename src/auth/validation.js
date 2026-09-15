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

  if (name === '') {
    return 'Informe seu nome.'
  }

  if (name.length < NAME_MIN) {
    return `O nome deve ter ao menos ${NAME_MIN} caracteres.`
  }

  if (name.length > NAME_MAX) {
    return `O nome deve ter no máximo ${NAME_MAX} caracteres.`
  }

  return null
}

export function validateEmail(value) {
  const email = value.trim()

  if (email === '') {
    return 'Informe seu e-mail.'
  }

  if (!EMAIL_PATTERN.test(email)) {
    return 'E-mail inválido.'
  }

  if (email.length > EMAIL_MAX) {
    return 'E-mail muito longo.'
  }

  return null
}

/** Senha do cadastro: regras de tamanho do backend. */
export function validateNewPassword(value) {
  if (value === '') {
    return 'Informe uma senha.'
  }

  if (value.length < PASSWORD_MIN) {
    return `A senha deve ter ao menos ${PASSWORD_MIN} caracteres.`
  }

  if (value.length > PASSWORD_MAX) {
    return `A senha deve ter no máximo ${PASSWORD_MAX} caracteres.`
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
  return value === '' ? 'Informe sua senha.' : null
}

/** Descarta chaves sem mensagem, para que o mapa vazio signifique "válido". */
export function collect(candidates) {
  return Object.fromEntries(Object.entries(candidates).filter(([, message]) => message !== null))
}
