import { useCart } from '../context/CartContext'
import { resolveImageUrl } from '../utils/media'

function formatPrice(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

export default function CartDrawer({ open, onClose, onCheckout }) {
  const { items, removeItem, updateQuantity, displayTotal } = useCart()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-obsidian/70 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-onyx border-l border-iron z-50 flex flex-col transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-iron">
          <h2 className="font-display text-xl text-ivory font-light tracking-wide">Your Cart</h2>
          <button
            onClick={onClose}
            className="text-pearl hover:text-ivory transition-colors"
            aria-label="Close cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 && (
            <div className="text-center py-16">
              <p className="text-mist font-body text-sm">Your cart is empty.</p>
            </div>
          )}
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex gap-4 bg-charcoal border border-iron/60 p-3">
              <div className="w-16 h-20 bg-iron overflow-hidden flex-shrink-0">
                {product.image_url ? (
                  <img src={resolveImageUrl(product.image_url)} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-iron" />
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  <p className="font-display text-sm text-ivory font-light leading-snug truncate">{product.name}</p>
                  <p className="font-body text-xs text-mist mt-0.5">{formatPrice(product.price_cents)}</p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="w-6 h-6 border border-iron text-pearl text-sm hover:border-accent hover:text-ivory flex items-center justify-center transition-colors"
                  >
                    −
                  </button>
                  <span className="text-sm text-ivory w-5 text-center font-body">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="w-6 h-6 border border-iron text-pearl text-sm hover:border-accent hover:text-ivory flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                onClick={() => removeItem(product.id)}
                className="text-mist hover:text-pearl self-start mt-0.5 transition-colors"
                aria-label="Remove item"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-iron space-y-4">
            <div className="flex justify-between font-body text-sm">
              <span className="text-pearl">Subtotal</span>
              <span className="text-ivory font-medium">{formatPrice(displayTotal)}</span>
            </div>
            <p className="text-xs text-mist font-body">Final total confirmed at checkout.</p>
            <button
              onClick={onCheckout}
              className="w-full bg-ivory text-obsidian py-3.5 font-body text-xs uppercase tracking-widest hover:bg-accent transition-colors duration-300"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  )
}
