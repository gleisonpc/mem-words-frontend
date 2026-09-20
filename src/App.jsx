import { useEffect } from 'react'
import { BrowserRouter } from 'react-router'
import { AuthProvider } from './auth/AuthProvider'
import { getLanguage, localeForLanguage } from './i18n/language'
import AppRoutes from './routes'

/**
 * Raiz da aplicação.
 *
 * O provedor de sessão fica **acima** do roteador: a guarda de rota precisa
 * do estado da sessão para decidir, e a sessão precisa sobreviver à troca de
 * telas sem ser determinada outra vez a cada navegação.
 */
export default function App() {
  // Aplica o idioma gravado ao atributo `lang` do documento na montagem —
  // equivalente à leitura inicial de `getTheme()` para `data-theme`, sem
  // precisar do truque de script embutido em `index.html` que o tema usa:
  // não há texto pintado antes do React montar, então não há lampejo a evitar.
  useEffect(() => {
    document.documentElement.lang = localeForLanguage(getLanguage())
  }, [])

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
