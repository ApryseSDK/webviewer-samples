// ES6 Compliant Syntax
// GitHub Copilot - Claude Sonnet 4.5 - December 22, 2025
// main.jsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  // <React.StrictMode> ❌ Comment this out in dev to avoid double calls
    <App />
  // </StrictMode>
)
