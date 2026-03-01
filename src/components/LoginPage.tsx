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

  const isEn = navigator.language.startsWith('en')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      setMessage(null)

      if (isSignUp) {
        await signUpWithEmail(email, password)
        setMessage(isEn ? 'Check your email to confirm your account' : 'Tjek din email for at bekr\u00e6fte din konto')
      } else {
        await signInWithEmail(email, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : (isEn ? 'Failed to sign in' : 'Kunne ikke logge ind'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>ITU Calendar</h1>
        <p>{isSignUp
          ? (isEn ? 'Create an account' : 'Opret en konto')
          : (isEn ? 'Sign in to manage your course schedule' : 'Log ind for at administrere dit kursusplan')
        }</p>

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
            placeholder={isEn ? 'Password' : 'Adgangskode'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <button type="submit" disabled={loading}>
            {loading
              ? (isEn ? 'Please wait...' : 'Vent venligst...')
              : (isSignUp
                ? (isEn ? 'Sign up' : 'Opret konto')
                : (isEn ? 'Sign in' : 'Log ind'))
            }
          </button>
        </form>

        <div className="toggle-mode">
          {isSignUp
            ? (isEn ? 'Already have an account?' : 'Har du allerede en konto?')
            : (isEn ? "Don't have an account?" : 'Har du ikke en konto?')
          }
          <button type="button" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? (isEn ? 'Sign in' : 'Log ind') : (isEn ? 'Sign up' : 'Opret konto')}
          </button>
        </div>
      </div>
    </div>
  )
}
