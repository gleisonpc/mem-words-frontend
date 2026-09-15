import Gallery from './components/Gallery'
import HealthStatus from './components/HealthStatus'
import './App.css'

/**
 * A galeria é alcançável por `?galeria` na URL.
 *
 * Decisão registrada em openspec: instalar um roteador só para servir uma
 * página de referência interna seria uma dependência e uma decisão de
 * arquitetura de navegação cedo demais. Quando o app tiver rotas de verdade, a
 * galeria migra para uma delas.
 */
function querGaleria() {
  return new URLSearchParams(window.location.search).has('galeria')
}

function App() {
  if (querGaleria()) {
    return <Gallery />
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>mem-words</h1>
        <p>Aplicativo para ajudar a memorizar palavras</p>
      </header>

      <HealthStatus />
    </main>
  )
}

export default App
