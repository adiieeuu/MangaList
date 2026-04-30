import { useState, useEffect } from 'react'
import LoginWindow from './components/LoginWindow'
import MangaDashboard from './components/MangaDashboard'
import './App.css'

const ADMIN_USER = 'adiieeuu'
const ADMIN_PASS = 'adrianpaul3114'
const SESSION_KEY = 'manga_admin_session'

function simpleHash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return h.toString()
}

const CORRECT_HASH = simpleHash(ADMIN_PASS)

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem(SESSION_KEY) === 'true'
  })

  const handleLogin = (username, password) => {
    if (username === ADMIN_USER && simpleHash(password) === CORRECT_HASH) {
      sessionStorage.setItem(SESSION_KEY, 'true')
      setIsLoggedIn(true)
      return true
    }
    return false
  }

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    setIsLoggedIn(false)
  }

  return (
    <div className="app-root">
      {isLoggedIn
        ? <MangaDashboard onLogout={handleLogout} />
        : <LoginWindow onLogin={handleLogin} />
      }
    </div>
  )
}