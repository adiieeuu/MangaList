import { useState } from 'react'
import './LoginWindow.css'

export default function LoginWindow({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [shaking, setShaking]   = useState(false)

  const handleLogin = () => {
    const ok = onLogin(username, password)
    if (!ok) {
      setError('Invalid credentials. Please try again.')
      setShaking(true)
      setTimeout(() => setShaking(false), 500)
    }
  }

  const onKey = (e) => { if (e.key === 'Enter') handleLogin() }

  return (
    <div className="login-wrapper">
      <div className="login-glow" />

      <div className={`login-card${shaking ? ' shake' : ''}`}>

        <div className="login-logo">
          <span className="login-logo-icon">📚</span>
          <h1>MANGA LIST</h1>
          <p>Admin Portal</p>
        </div>

        <div className="login-form">
          <div className="login-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              placeholder="Enter username"
              autoComplete="username"
              onChange={e => { setUsername(e.target.value); setError('') }}
              onKeyDown={onKey}
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              placeholder="Enter password"
              autoComplete="current-password"
              onChange={e => { setPassword(e.target.value); setError('') }}
              onKeyDown={onKey}
            />
          </div>

          <p className="login-error">{error}</p>

          <button className="login-btn" onClick={handleLogin}>LOGIN</button>

          <p className="login-hint">
            Default: <span>adiieeuu</span> / adrianpaul3114
          </p>
        </div>
      </div>
    </div>
  )
}