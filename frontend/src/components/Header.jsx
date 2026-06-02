import { useCart } from '../context/CartContext'
import { useMagnetic } from '../hooks/useMagnetic'

export default function Header({ onCartOpen }) {
  const { totalItems } = useCart()
  const cartRef = useMagnetic(0.3)

  return (
    <header className="w-full max-w-[1446px] mx-auto px-4 lg:px-0 pt-8 z-50 relative">
      <nav className="bg-espresso rounded-xl px-6 lg:px-10 py-5 flex items-center justify-between shadow-2xl hover:-translate-y-0.5 transition-transform duration-500">
        <div className="flex items-center gap-12">
          <a href="/" className="text-2xl font-normal tracking-tighter text-cream font-display hover:scale-105 transition-transform duration-300">
            NUMME
          </a>
          <div className="hidden md:flex items-center gap-8 text-cream/80">
            {[
              { href: '#abayas', label: 'Abayas' },
              { href: '#thobes', label: 'Thobes' },
              { href: '#accessories', label: 'Accessories' },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="nav-link relative text-sm uppercase tracking-widest hover:opacity-50 transition-opacity duration-300"
                onClick={(e) => {
                  e.preventDefault()
                  const el = document.querySelector(href)
                  if (el) window.scrollTo({ top: el.offsetTop - 120, behavior: 'smooth' })
                }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        <button
          ref={cartRef}
          onClick={onCartOpen}
          className="relative inline-flex items-center justify-center gap-2 px-6 py-2 border border-cream/40 text-cream rounded-2xl text-sm hover:bg-cream hover:text-espresso hover:border-cream active:scale-95 transition-all duration-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Cart
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-clay text-cream text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {totalItems}
            </span>
          )}
        </button>
      </nav>
    </header>
  )
}
