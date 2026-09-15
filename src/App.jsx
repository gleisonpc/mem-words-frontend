import HealthStatus from './components/HealthStatus'
import './App.css'

function App() {
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
