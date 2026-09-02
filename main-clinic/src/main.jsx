// Saebyeok - refactored at 032026
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'

import './i18n'
import './assets/index.css'

axios.defaults.withCredentials = true;

createRoot(document.getElementById('root')).render(
    <App />
)

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//  </StrictMode>,
// )
