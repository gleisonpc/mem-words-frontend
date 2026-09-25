const SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

/**
 * Carrega o script do Google Identity Services (GIS) sob demanda — só
 * quando uma tela de entrada/cadastro monta e a configuração do Google está
 * presente, não sempre em `index.html` (ver design.md).
 *
 * Guardada como **promessa**, não como sinalizador: chamadas concorrentes
 * (ex. entrada e cadastro montando quase juntas, ou remontagem) aguardam o
 * mesmo carregamento em vez de inserir a tag de novo.
 */
let scriptPromise = null

function loadScript() {
  if (typeof window !== 'undefined' && window.google?.accounts?.id) {
    return Promise.resolve()
  }

  if (scriptPromise === null) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = SCRIPT_SRC
      script.async = true
      script.defer = true
      script.onload = () => resolve()
      script.onerror = () => {
        // Falha aqui é definitiva para esta tentativa (rede, bloqueador de
        // terceiros) — uma remontagem tenta carregar de novo.
        scriptPromise = null
        reject(new Error('Não foi possível carregar o script do Google.'))
      }
      document.head.appendChild(script)
    })
  }

  return scriptPromise
}

/**
 * Carrega o GIS (se preciso) e inicializa `google.accounts.id` com o Client
 * ID e o callback dados.
 *
 * `callback` recebe `{ credential }` do Google em caso de sucesso —
 * `credential` é o ID token. `errorCallback`, quando suportado pela versão
 * carregada do GIS, cobre falhas de configuração (ex. origem não
 * autorizada) que não passam pelo callback de sucesso.
 */
export async function initializeGoogleIdentity({ clientId, callback, errorCallback }) {
  await loadScript()

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback,
    ...(errorCallback && { error_callback: errorCallback }),
  })
}

/** Renderiza o botão do próprio Google no elemento dado. */
export function renderGoogleButton(container, options = {}) {
  window.google.accounts.id.renderButton(container, {
    type: 'standard',
    size: 'large',
    width: 320,
    ...options,
  })
}
