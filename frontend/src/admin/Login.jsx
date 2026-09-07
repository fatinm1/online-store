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
    <div className="min-h-screen bg-obsidian flex items-center justify-center p-4 relative">
      <div className="grain-overlay" aria-hidden="true" />
      <div className="bg-onyx border border-iron w-full max-w-sm p-8 relative">
        <p className="font-script text-accent text-3xl leading-none mb-1">Welcome back</p>
        <h1 className="font-display text-3xl text-ivory font-light mb-2">NUMME Admin</h1>
        <p className="font-body text-sm text-mist mb-8">Sign in to manage your store.</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-body text-xs uppercase tracking-widest text-mist mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-charcoal border border-iron text-ivory font-body text-sm px-4 py-3 focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block font-body text-xs uppercase tracking-widest text-mist mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-charcoal border border-iron text-ivory font-body text-sm px-4 py-3 focus:outline-none focus:border-accent"
            />
          </div>
          {error && <p className="text-red-400 font-body text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ivory text-obsidian py-3.5 font-body text-xs uppercase tracking-widest disabled:opacity-50 hover:bg-accent transition-colors duration-300"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
