import { useState, useEffect } from 'react'
import { api } from '../api/client'
import { useSectionReveal } from '../hooks/useReveal'
import ProductCard from './ProductCard'

export default function ProductGrid({ category, title }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [gridRef, deckVisible] = useSectionReveal()

  useEffect(() => {
    setLoading(true)
    setError(null)
    api.getProducts(category)
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [category])

  return (
    <section className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
      {title && (
        <h2 className="font-display text-4xl lg:text-5xl text-ivory font-light mb-12">{title}</h2>
      )}

      <div
        ref={gridRef}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8"
      >
        {loading && Array.from({ length: 8 }).map((_, k) => (
          <div key={k} className="aspect-[3/4] bg-charcoal animate-pulse" />
        ))}

        {error && (
          <p className="col-span-4 text-mist font-body text-sm text-center py-16">
            Could not load products. Please try again.
          </p>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="col-span-4 text-mist font-body text-sm text-center py-16">
            No items available right now.
          </p>
        )}

        {!loading && !error && products.map((p, idx) => (
          <ProductCard
            key={p.id}
            product={p}
            deckVisible={deckVisible}
            deckIndex={idx}
          />
        ))}
      </div>
    </section>
  )
}
