import { useCart } from '../context/CartContext'

function formatPrice(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

export default function CartDrawer({ open, onClose, onCheckout }) {
  const { items, removeItem, updateQuantity, displayTotal } = useCart()

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-espresso/50 z-40" onClick={onClose} />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-cream z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-sand">
          <h2 className="font-display text-xl text-espresso">Your Cart</h2>
          <button onClick={onClose} className="text-clay hover:text-espresso">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 && (
            <p className="text-clay/60 font-body text-sm text-center py-8">Your cart is empty.</p>
          )}
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex gap-4 bg-parchment rounded-xl p-3">
              <div className="w-16 h-16 bg-sand rounded-lg overflow-hidden flex-shrink-0">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-sand" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm text-espresso truncate">{product.name}</p>
                <p className="font-body text-xs text-clay mb-2">{formatPrice(product.price_cents)}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="w-6 h-6 rounded-full bg-sand text-espresso text-sm flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-sm text-espresso w-4 text-center">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="w-6 h-6 rounded-full bg-sand text-espresso text-sm flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                onClick={() => removeItem(product.id)}
                className="text-clay/40 hover:text-clay self-start"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-sand">
            <div className="flex justify-between font-body text-espresso mb-4">
              <span>Subtotal (display)</span>
              <span className="font-medium">{formatPrice(displayTotal)}</span>
            </div>
            <p className="text-xs text-clay/60 font-body mb-4">
              Final total is confirmed at checkout.
            </p>
            <button
              onClick={onCheckout}
              className="w-full bg-espresso hover:bg-clay text-cream py-3 rounded-xl font-body transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  )
}
