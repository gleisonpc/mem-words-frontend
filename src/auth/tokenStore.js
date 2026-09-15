/**
 * Depósito dos tokens da sessão.
 *
 * É a única parte do frontend que conhece o `localStorage`. Existe para
 * quebrar o ciclo que apareceria se o cliente HTTP (que precisa do token e da
 * renovação) e o contexto de sessão (que precisa do cliente) tivessem de se
 * importar um ao outro: os dois falam com este módulo, e não entre si.
 *
 * Nenhuma tela importa este arquivo — para as telas, a fonte de verdade sobre
 * a sessão é o contexto.
 */

/** Chave única; o prefixo evita colisão com outra aplicação na mesma origem. */
const STORAGE_KEY = 'mem-words.auth'

/** Motivos de um encerramento, que o contexto usa para decidir o que dizer. */
export const LOGOUT = 'logout'
export const SESSION_EXPIRED = 'session-expired'

/**
 * Estado em memória — a fonte usada em tempo de execução. O `localStorage` é
 * só o espelho que sobrevive à recarga.
 */
let session = null

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

/** Aceita apenas o que tem os dois tokens: o resto não serve como sessão. */
function parse(raw) {
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw)

    if (typeof parsed?.accessToken !== 'string' || typeof parsed?.refreshToken !== 'string') {
      return null
    }

    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      user: parsed.user ?? null,
    }
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
    if (session === null) {
      storage.removeItem(STORAGE_KEY)
    } else {
      storage.setItem(STORAGE_KEY, JSON.stringify(session))
    }
  })
}

session = restore()

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
  return session?.accessToken ?? null
}

export function getRefreshToken() {
  return session?.refreshToken ?? null
}

/** O usuário guardado é dica de exibição, nunca prova de sessão válida. */
export function getStoredUser() {
  return session?.user ?? null
}

export function hasTokens() {
  return session !== null
}

/** Grava a sessão inteira — o caso da entrada e do cadastro. */
export function setSession({ accessToken, refreshToken, user = null }) {
  session = { accessToken, refreshToken, user }
  persist()
}

/**
 * Substitui o par de tokens preservando o usuário: é o que a renovação
 * devolve, já que `/auth/refresh` não repete os dados do usuário.
 */
export function setTokens({ accessToken, refreshToken }) {
  session = { accessToken, refreshToken, user: session?.user ?? null }
  persist()
}

/** Atualiza o usuário guardado sem tocar nos tokens. */
export function setUser(user) {
  if (session !== null) {
    session = { ...session, user }
    persist()
  }
}

/**
 * Descarta a sessão e avisa os inscritos, uma única vez por encerramento:
 * limpar o que já está limpo não notifica ninguém.
 */
export function clear(reason = SESSION_EXPIRED) {
  if (session === null) {
    return
  }

  session = null
  persist()

  for (const listener of listeners) {
    listener(reason)
  }
}
