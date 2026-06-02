import { Navigate, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminLayout() {
  const { admin, loading, logout } = useAuth()

  if (loading) return <div className="min-h-screen bg-cream flex items-center justify-center"><p className="font-body text-clay">Loading...</p></div>
  if (!admin) return <Navigate to="/admin/login" replace />

  return (
    <div className="min-h-screen bg-cream flex">
      <aside className="w-44 bg-espresso flex flex-col">
        <div className="p-6 border-b border-white/10">
          <span className="font-display text-xl text-cream tracking-widest">NUMME</span>
          <p className="font-body text-xs text-sand/60 mt-1">Admin</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { to: '/admin', label: 'Dashboard', end: true },
            { to: '/admin/products', label: 'Products' },
            { to: '/admin/orders', label: 'Orders' },
          ].map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `block px-4 py-2 rounded-xl font-body text-sm transition-colors ${
                  isActive ? 'bg-gold/20 text-gold' : 'text-sand/70 hover:text-sand hover:bg-white/5'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4">
          <button
            onClick={logout}
            className="w-full text-left px-4 py-2 rounded-xl font-body text-sm text-sand/50 hover:text-sand hover:bg-white/5 transition-colors"
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-4 lg:p-6">
        <Outlet />
      </main>
    </div>
  )
}
