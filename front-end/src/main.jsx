import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'
import dayjs from 'dayjs'
import 'dayjs/locale/fr'
import App from './App.jsx'
import './index.css'
import { clearTableCache } from './utils/tableCache.js'

axios.defaults.withCredentials = true
axios.interceptors.response.use((response) => {
  const method = String(response.config?.method || 'get').toLowerCase()
  if (['post', 'put', 'patch', 'delete'].includes(method)) clearTableCache()
  return response
})
dayjs.locale('fr')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>  {/* ✅ UN SEUL ROUTER ICI */}
      <App />
    </BrowserRouter>
  </StrictMode>
)
