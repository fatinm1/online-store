import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { admin, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  if (admin) return <Navigate to="/admin" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
      navigate('/admin')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-espresso flex items-center justify-center p-4">
      <div className="bg-cream rounded-2xl w-full max-w-sm p-8 shadow-2xl">
        <h1 className="font-display text-2xl text-espresso mb-2">NUMME Admin</h1>
        <p className="font-body text-sm text-clay/60 mb-8">Sign in to manage your store.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-body text-sm text-clay mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full border border-sand rounded-xl px-4 py-3 font-body text-sm text-espresso bg-parchment focus:outline-none focus:border-clay"
            />
          </div>
          <div>
            <label className="block font-body text-sm text-clay mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full border border-sand rounded-xl px-4 py-3 font-body text-sm text-espresso bg-parchment focus:outline-none focus:border-clay"
            />
          </div>
          {error && <p className="text-red-600 font-body text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-espresso hover:bg-clay disabled:opacity-50 text-cream py-3 rounded-xl font-body transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
