import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { UsageProvider } from './context/UsageContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UsageProvider>
      <App />
    </UsageProvider>
  </StrictMode>,
)
