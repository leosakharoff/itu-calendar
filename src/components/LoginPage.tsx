import { useState } from 'react'
import { useAuthContext } from '../contexts/AuthContext'
import './LoginPage.css'

export function LoginPage() {
  const { signInWithEmail, signUpWithEmail } = useAuthContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      setMessage(null)

      if (isSignUp) {
        await signUpWithEmail(email, password)
        setMessage('Check your email to confirm your account')
      } else {
        await signInWithEmail(email, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>ITU Calendar</h1>
        <p>{isSignUp ? 'Create an account' : 'Sign in to manage your course schedule'}</p>

        {error && <div className="login-error">{error}</div>}
        {message && <div className="login-message">{message}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : (isSignUp ? 'Sign up' : 'Sign in')}
          </button>
        </form>

        <div className="toggle-mode">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button type="button" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </div>
      </div>
    </div>
  )
}
