import { useCart } from '../context/CartContext'
import { useTilt } from '../hooks/useTilt'

function formatPrice(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

// Starting pile positions — cycles for grids with more than 4 cards
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
  const delay = 100 + deckIndex * 200

  const isAvailable = product.in_stock

  return (
    <div
      ref={cardRef}
      className={`deck-card group space-y-4 cursor-pointer ${deckVisible ? 'deck-visible' : 'deck-hidden'}`}
      style={{
        '--deck-x': offset.x,
        '--deck-y': offset.y,
        '--deck-r': offset.r,
        transitionDelay: deckVisible ? `${delay}ms` : '0ms',
      }}
    >
      {/* Image container */}
      <div className={`aspect-[3/4] rounded-xl overflow-hidden bg-parchment relative shadow-sm group-hover:shadow-xl transition-shadow duration-500 ${!isAvailable ? 'opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100' : ''}`}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="tilt-image w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 sepia-[0.05]"
          />
        ) : (
          <div className="w-full h-full bg-sand flex items-center justify-center text-clay/20">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Available / sold badge */}
        {isAvailable ? (
          <div className="absolute top-4 right-4 bg-espresso text-cream px-3 py-1 rounded-full text-[10px] uppercase tracking-widest shadow-md">
            Available
          </div>
        ) : (
          <div className="absolute top-4 right-4 bg-espresso/80 text-cream px-3 py-1 rounded-full text-[10px] uppercase tracking-widest">
            Sold Out
          </div>
        )}

        {/* Overlay with quick-add button — slides up on hover */}
        {isAvailable && (
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/60 to-transparent">
            <button
              onClick={(e) => { e.stopPropagation(); addItem(product) }}
              className="w-full bg-cream text-espresso py-2 rounded-lg text-xs uppercase tracking-widest font-bold hover:bg-espresso hover:text-cream transition-colors duration-200"
            >
              Quick Add
            </button>
          </div>
        )}

        {/* Tint overlay */}
        <div className="absolute inset-0 bg-clay/0 group-hover:bg-clay/10 transition-colors duration-500 pointer-events-none" />
      </div>

      {/* Card info */}
      <div className={`flex justify-between items-start ${!isAvailable ? 'opacity-60' : ''}`}>
        <div className="group-hover:translate-x-1 transition-transform duration-300">
          <h4 className="text-base xl:text-lg tracking-tight font-display text-espresso">{product.name}</h4>
          <p className="text-espresso/60 text-xs xl:text-sm font-body capitalize">{product.category}</p>
        </div>
        <span className="text-sm xl:text-base font-bold group-hover:text-black transition-colors font-body">
          {formatPrice(product.price_cents)}
        </span>
      </div>
    </div>
  )
}
