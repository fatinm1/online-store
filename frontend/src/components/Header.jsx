import { useCart } from '../context/CartContext'

export default function Header({ onCartOpen }) {
  const { totalItems } = useCart()

  return (
    <header className="sticky top-4 z-40 mx-4">
      <div className="flex items-center justify-between px-6 py-4 bg-espresso/95 backdrop-blur rounded-2xl shadow-lg">
        <a href="/" className="font-display text-2xl text-cream tracking-widest">
          NUMME
        </a>
        <nav className="hidden md:flex gap-8 font-body text-sm text-sand">
          <a href="#abayas" className="hover:text-gold transition-colors">Abayas</a>
          <a href="#thobes" className="hover:text-gold transition-colors">Thobes</a>
          <a href="#accessories" className="hover:text-gold transition-colors">Accessories</a>
        </nav>
        <button
          onClick={onCartOpen}
          className="relative flex items-center gap-2 bg-gold/20 hover:bg-gold/30 text-cream px-4 py-2 rounded-xl text-sm transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      </div>
    </header>
  )
}
