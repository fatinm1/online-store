import { Navigate, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminLayout() {
  const { admin, loading, logout } = useAuth()

  if (loading) return <div className="min-h-screen bg-obsidian flex items-center justify-center"><p className="font-body text-mist">Loading...</p></div>
  if (!admin) return <Navigate to="/admin/login" replace />

  return (
    <div className="min-h-screen bg-obsidian flex">
      <aside className="w-52 bg-onyx border-r border-iron flex flex-col">
        <div className="p-6 border-b border-iron">
          <span className="font-display text-xl text-ivory tracking-widest">NUMME</span>
          <p className="font-body text-xs text-mist mt-1">Admin</p>
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
                `block px-4 py-2 border-l-2 font-body text-sm tracking-wide transition-colors ${
                  isActive ? 'border-accent text-accent bg-iron/40' : 'border-transparent text-mist hover:text-ivory hover:border-iron'
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
            className="w-full text-left px-4 py-2 font-body text-xs uppercase tracking-widest text-mist hover:text-ivory transition-colors"
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6 lg:p-10">
        <Outlet />
      </main>
    </div>
  )
}
