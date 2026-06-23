import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/products', label: 'All Products' },
  { to: '/abayas', label: 'Abayas' },
  { to: '/thobes', label: 'Thobes' },
  { to: '/accessories', label: 'Accessories' },
  { to: '/contact', label: 'Contact' },
]

const MOBILE_LINKS = [
  ...NAV_LINKS,
  { to: '/refund-policy', label: 'Refund Policy' },
  { to: '/shipping-policy', label: 'Shipping Policy' },
  { to: '/sizing-chart', label: 'Sizing Chart' },
]

export default function Header({ onCartOpen }) {
  const { totalItems } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-obsidian/96 backdrop-blur-md border-b border-iron">
        {/* ── Top bar: icons | NUMME | cart ─────────────────────────────── */}
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">

          {/* Left: utility icons */}
          <div className="flex items-center gap-4 w-28">
            <button
              className="hidden sm:block text-pearl hover:text-ivory transition-colors"
              aria-label="Search"
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
            <button
              className="hidden sm:block text-pearl hover:text-ivory transition-colors"
              aria-label="Account"
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </button>
            {/* Mobile hamburger */}
            <button
              className="lg:hidden text-pearl hover:text-ivory transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>

          {/* Center: wordmark */}
          <Link
            to="/"
            className="text-[22px] font-display font-light tracking-[0.45em] text-ivory hover:text-accent transition-colors duration-300"
          >
            NUMME
          </Link>

          {/* Right: cart */}
          <div className="flex items-center justify-end w-28">
            <button
              onClick={onCartOpen}
              className="relative text-pearl hover:text-ivory transition-colors"
              aria-label={`Cart — ${totalItems} item${totalItems !== 1 ? 's' : ''}`}
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2.5 bg-accent text-obsidian text-[10px] font-bold min-w-[17px] h-[17px] rounded-full flex items-center justify-center leading-none px-1">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── Desktop nav row ───────────────────────────────────────────── */}
        <div className="hidden lg:block border-t border-iron/50">
          <nav className="max-w-[1440px] mx-auto px-12 h-10 flex items-center justify-center gap-10">
            {NAV_LINKS.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `nav-link relative text-[11px] uppercase tracking-widest font-body transition-colors ${
                    isActive ? 'text-ivory' : 'text-pearl hover:text-ivory'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* ── Mobile drawer ─────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[60] lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm" />
          <nav
            className="absolute top-0 left-0 h-full w-[280px] bg-onyx border-r border-iron flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-8 h-16 border-b border-iron">
              <span className="font-display text-lg tracking-[0.4em] text-ivory">NUMME</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-pearl hover:text-ivory transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-8 px-8 space-y-1">
              {MOBILE_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 text-pearl hover:text-ivory font-body text-sm uppercase tracking-widest border-b border-iron/30 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="p-8 border-t border-iron">
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className="text-mist hover:text-pearl font-body text-xs uppercase tracking-widest transition-colors"
              >
                Admin
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
