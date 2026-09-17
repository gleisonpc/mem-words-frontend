import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { getTheme, setTheme } from './theme.js'

// O script embutido em index.html já aplica a escolha guardada antes da
// primeira pintura; isto garante o mesmo resultado mesmo se aquele script
// não rodar por algum motivo (ex.: uma ferramenta que ignora scripts
// inline) — sem custo, porque aplicar de novo o que já está aplicado não
// tem efeito observável.
setTheme(getTheme())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
