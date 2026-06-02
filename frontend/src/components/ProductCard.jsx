import { useEffect, useRef } from 'react'
import { useCart } from '../context/CartContext'

function formatPrice(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && el.classList.add('visible'),
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <article ref={ref} className="reveal group bg-parchment rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-[3/4] bg-sand overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-clay/40">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg text-espresso mb-1">{product.name}</h3>
        <p className="font-body text-sm text-clay/70 mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="font-body text-espresso font-medium">{formatPrice(product.price_cents)}</span>
          {product.in_stock ? (
            <button
              onClick={() => addItem(product)}
              className="bg-espresso hover:bg-clay text-cream text-sm px-4 py-2 rounded-xl transition-colors"
            >
              Add to Cart
            </button>
          ) : (
            <span className="text-sm text-clay/50 font-body">Sold Out</span>
          )}
        </div>
      </div>
    </article>
  )
}
