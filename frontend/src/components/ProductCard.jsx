import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useTilt } from '../hooks/useTilt'

function formatPrice(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

const DECK_OFFSETS = [
  { x: '-60px', y: '40px', r: '-12deg' },
  { x: '-20px', y: '20px', r: '5deg' },
  { x: '20px',  y: '30px', r: '-6deg' },
  { x: '60px',  y: '50px', r: '10deg' },
  { x: '-40px', y: '55px', r: '8deg' },
  { x: '40px',  y: '15px', r: '-9deg' },
]

export default function ProductCard({ product, deckVisible, deckIndex }) {
  const { addItem } = useCart()
  const cardRef = useTilt()
  const offset = DECK_OFFSETS[deckIndex % DECK_OFFSETS.length]
  const delay = 80 + deckIndex * 140

  const isAvailable = product.in_stock

  return (
    <div
      ref={cardRef}
      className={`deck-card group cursor-pointer ${deckVisible ? 'deck-visible' : 'deck-hidden'}`}
      style={{
        '--deck-x': offset.x,
        '--deck-y': offset.y,
        '--deck-r': offset.r,
        transitionDelay: deckVisible ? `${delay}ms` : '0ms',
      }}
    >
      {/* Image */}
      <Link to={`/product/${product.slug}`} tabIndex={-1} className="block">
        <div
          className={`aspect-[3/4] overflow-hidden bg-charcoal relative ${
            !isAvailable ? 'opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-80' : ''
          }`}
        >
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="tilt-image w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-iron flex items-center justify-center">
              <svg className="w-8 h-8 text-mist" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Sold out badge */}
          {!isAvailable && (
            <div className="absolute top-3 left-3 bg-obsidian/90 text-pearl px-3 py-1 text-[10px] uppercase tracking-widest font-body">
              Sold Out
            </div>
          )}

          {/* Quick add — slides up on hover */}
          {isAvailable && (
            <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out bg-gradient-to-t from-obsidian/85 via-obsidian/40 to-transparent pt-8 pb-4 px-4">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); addItem(product) }}
                className="w-full bg-ivory text-obsidian py-2.5 text-[11px] uppercase tracking-widest font-body hover:bg-accent transition-colors duration-200"
              >
                Quick Add
              </button>
            </div>
          )}
        </div>
      </Link>

      {/* Card info */}
      <div className="mt-3 space-y-0.5">
        <Link
          to={`/product/${product.slug}`}
          className="block group/info"
        >
          <h4 className="font-display text-ivory text-base font-light leading-tight group-hover/info:text-accent transition-colors duration-200">
            {product.name}
          </h4>
          <p className="text-mist text-[11px] uppercase tracking-widest font-body capitalize mt-0.5">
            {product.category}
          </p>
        </Link>
        <p className="text-pearl font-body text-sm pt-1">{formatPrice(product.price_cents)}</p>
      </div>
    </div>
  )
}
