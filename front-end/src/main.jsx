import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'
import dayjs from 'dayjs'
import 'dayjs/locale/fr'
import App from './App.jsx'
import './index.css'

axios.defaults.withCredentials = true
dayjs.locale('fr')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>  {/* ✅ UN SEUL ROUTER ICI */}
      <App />
    </BrowserRouter>
  </StrictMode>
)
