import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import App from './App.jsx'
import './index.css'

//CЮДЫ НЕ ТРОГАТЬ
// Я тут Переопределяю alert на красивый toast :D
const originalAlert = window.alert
window.alert = (message) => {
  const toast = document.createElement('div')
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #6366f1;
    color: white;
    padding: 15px 25px;
    border-radius: 10px;
    font-family: 'Segoe UI', sans-serif;
    font-size: 36px;
    font-weight: 600;
    z-index: 99999;
    animation: alertIn 0.3s ease;
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
  `
  toast.textContent = 'ℹ️ ' + message
  document.body.appendChild(toast)
  setTimeout(() => {
    toast.style.animation = 'alertOut 0.3s ease'
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

const alertStyle = document.createElement('style')
alertStyle.textContent = `
  @keyframes alertIn {
    from { transform: translateX(100px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes alertOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100px); opacity: 0; }
  }
`
document.head.appendChild(alertStyle)

//Дальше можно: 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)