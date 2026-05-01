import { useState } from 'react'
import LoginWindow from './components/LoginWindow'
import MangaDashboard from './components/MangaDashboard'
import { login, register, clearSession, getSession } from './services/MangaService'
import './App.css'

export default function App() {
  const [user, setUser] = useState(() => getSession())

  const handleLogin = async (username, password) => {
    try {
      const data = await login(username, password)
      setUser(data)
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  }

  const handleRegister = async (username, password) => {
    try {
      const data = await register(username, password)
      setUser(data)
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  }

  const handleLogout = () => {
    clearSession()
    setUser(null)
  }

  return (
    <div className="app-root">
      {user
        ? <MangaDashboard user={user} onLogout={handleLogout} />
        : <LoginWindow onLogin={handleLogin} onRegister={handleRegister} />
      }
    </div>
  )
}