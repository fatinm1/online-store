import { createContext, useContext, useState, useEffect } from 'react'
import { adminApi, setCsrfToken } from '../api/admin'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.me()
      .then(setAdmin)
      .catch(() => setAdmin(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const data = await adminApi.login(email, password)
    setCsrfToken(data.csrf_token)
    setAdmin(data.admin)
  }

  const logout = async () => {
    await adminApi.logout().catch(() => {})
    setCsrfToken('')
    setAdmin(null)
  }

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
