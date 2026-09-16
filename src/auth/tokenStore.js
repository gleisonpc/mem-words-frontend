/**
 * Depósito da sessão.
 *
 * É a única parte do frontend que conhece o `localStorage`. Existe para
 * quebrar o ciclo que apareceria se o cliente HTTP (que precisa do token e da
 * renovação) e o contexto de sessão (que precisa do cliente) tivessem de se
 * importar um ao outro: os dois falam com este módulo, e não entre si.
 *
 * Nenhuma tela importa este arquivo — para as telas, a fonte de verdade sobre
 * a sessão é o contexto.
 *
 * O token de renovação nunca passa por aqui — nem por nenhum outro lugar do
 * frontend. O backend o entrega e o exige por cookie `HttpOnly`: o navegador
 * o guarda e o envia sozinho, e nenhum JavaScript, legítimo ou injetado,
 * consegue lê-lo. O token de acesso, de vida curta, existe só na variável em
 * memória abaixo — nunca é gravado no `localStorage`, para não deixar pela
 * metade o problema que essa mudança existe para resolver.
 *
 * O que persiste é só uma dica não sensível — "uma sessão foi iniciada antes"
 * — e o usuário para exibição. Ela não prova sessão válida; só evita que
 * quem nunca autenticou pague, na abertura da aplicação, uma tentativa de
 * renovação fadada a falhar.
 */

/** Chave única; o prefixo evita colisão com outra aplicação na mesma origem. */
const STORAGE_KEY = 'mem-words.auth'

/** Motivos de um encerramento, que o contexto usa para decidir o que dizer. */
export const LOGOUT = 'logout'
export const SESSION_EXPIRED = 'session-expired'

/**
 * Token de acesso em memória — nunca persistido. Depois de uma recarga, ele
 * sempre volta `null`, mesmo com uma sessão anterior guardada (`hint`
 * abaixo): é essa lacuna que aciona a renovação pelo cookie na abertura.
 */
let accessToken = null

/**
 * Dica de sessão: `null` quando não há sessão anterior, ou `{ user }` quando
 * há. É o único dado que sobrevive a uma recarga — restaurado do
 * `localStorage` na carga do módulo, e a partir daí mantido em memória e
 * espelhado a cada mudança.
 */
let hint = restore()

const listeners = new Set()

/**
 * Toda conversa com o armazenamento passa por aqui porque ela pode **lançar**,
 * e não apenas devolver vazio: em janela privativa ou com dados de site
 * bloqueados, o simples acesso a `window.localStorage` levanta exceção. Sem
 * este cerco, isso derrubaria a aplicação inteira na inicialização.
 */
function withStorage(operation, fallback = null) {
  try {
    return operation(window.localStorage)
  } catch {
    // Degradação silenciosa: a sessão passa a valer apenas enquanto a página
    // estiver aberta. Não é um erro que o usuário possa resolver, então não
    // há por que lhe mostrar nada.
    return fallback
  }
}

/** Aceita apenas o formato da dica atual: `hasSession` mais o usuário. */
function parse(raw) {
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw)
    return parsed?.hasSession === true ? { user: parsed.user ?? null } : null
  } catch {
    return null
  }
}

/** Lê o que estava guardado. Chamado uma vez, na carga do módulo. */
function restore() {
  return withStorage((storage) => parse(storage.getItem(STORAGE_KEY)))
}

function persist() {
  withStorage((storage) => {
    if (hint === null) {
      storage.removeItem(STORAGE_KEY)
    } else {
      storage.setItem(STORAGE_KEY, JSON.stringify({ hasSession: true, user: hint.user }))
    }
  })
}

/**
 * Registra interesse no encerramento da sessão e devolve a função que
 * cancela a inscrição.
 *
 * Só o encerramento é notificado: o contexto já sabe quando ele mesmo criou
 * uma sessão, e o que ele não tem como perceber sozinho é a sessão morrendo
 * dentro de uma renovação recusada.
 */
export function onSessionEnded(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getAccessToken() {
  return accessToken
}

/** O usuário guardado é dica de exibição, nunca prova de sessão válida. */
export function getStoredUser() {
  return hint?.user ?? null
}

/**
 * Há uma sessão anterior a tentar restaurar? Não prova nada por si — só diz
 * se vale tentar renovar pelo cookie antes de assumir "sem sessão".
 */
export function hasSessionHint() {
  return hint !== null
}

/** Grava a sessão inteira — o caso da entrada e do cadastro. */
export function setSession({ accessToken: token, user = null }) {
  accessToken = token
  hint = { user }
  persist()
}

/**
 * Substitui o token de acesso preservando o usuário guardado: é o que a
 * renovação devolve.
 */
export function setTokens({ accessToken: token }) {
  accessToken = token
  hint = { user: hint?.user ?? null }
  persist()
}

/** Atualiza o usuário guardado sem tocar no token. */
export function setUser(user) {
  if (hint !== null) {
    hint = { user }
    persist()
  }
}

/**
 * Descarta a sessão e avisa os inscritos, uma única vez por encerramento:
 * limpar o que já está limpo não notifica ninguém.
 */
export function clear(reason = SESSION_EXPIRED) {
  if (hint === null && accessToken === null) {
    return
  }

  accessToken = null
  hint = null
  persist()

  for (const listener of listeners) {
    listener(reason)
  }
}
