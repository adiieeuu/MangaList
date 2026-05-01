import { useState } from 'react'
import './LoginWindow.css'

export default function LoginWindow({ onLogin, onRegister }) {
  const [mode,     setMode]     = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [error,    setError]    = useState('')
  const [shaking,  setShaking]  = useState(false)

  const shake = (msg) => {
    setError(msg)
    setShaking(true)
    setTimeout(() => setShaking(false), 500)
  }

  const handleSubmit = async () => {
    setError('')
    if (mode === 'register') {
      if (password !== confirm) return shake('Passwords do not match.')
      const res = await onRegister(username, password)
      if (!res.ok) shake(res.error)
    } else {
      const res = await onLogin(username, password)
      if (!res.ok) shake(res.error || 'Invalid credentials. Please try again.')
    }
  }

  const onKey = (e) => { if (e.key === 'Enter') handleSubmit() }

  const switchMode = (m) => {
    setMode(m)
    setError('')
    setUsername('')
    setPassword('')
    setConfirm('')
  }

  return (
    <div className="login-wrapper">
      <div className="login-glow" />
      <div className={`login-card${shaking ? ' shake' : ''}`}>
        <div className="login-logo">
          <span className="login-logo-icon">📚</span>
          <h1>MANGA LIST</h1>
          <p>Log In</p>
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
              placeholder={mode === 'register' ? 'Min. 6 characters' : 'Enter password'}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              onChange={e => { setPassword(e.target.value); setError('') }}
              onKeyDown={onKey}
            />
          </div>
          {mode === 'register' && (
            <div className="login-field">
              <label htmlFor="confirm">Confirm Password</label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                placeholder="Re-enter password"
                autoComplete="new-password"
                onChange={e => { setConfirm(e.target.value); setError('') }}
                onKeyDown={onKey}
              />
            </div>
          )}
          <p className="login-error">{error}</p>
          <button className="login-btn" onClick={handleSubmit}>
            {mode === 'login' ? 'LOGIN' : 'REGISTER'}
          </button>
          {mode === 'login' ? (
            <>
              <p className="login-hint">
              
              </p>
              <p className="login-hint">
                No account?{' '}
                <span
                  style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => switchMode('register')}
                >
                  Register here
                </span>
              </p>
            </>
          ) : (
            <p className="login-hint">
              Already have an account?{' '}
              <span
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => switchMode('login')}
              >
                Login here
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}