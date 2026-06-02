import { useState, useEffect } from 'react'
import { api } from '../api/client'
import { useReveal, useSectionReveal } from '../hooks/useReveal'
import ProductCard from './ProductCard'

export default function ProductGrid({ category, title, id }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Reveal the section heading
  const [headingRef, headingVisible] = useReveal(0)
  // Section-level observer: when the product grid enters view, spread the deck
  const [gridRef, deckVisible] = useSectionReveal()

  useEffect(() => {
    api.getProducts(category)
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [category])

  return (
    <section id={id} className="w-full max-w-[1446px] mx-auto px-4 lg:px-0 mt-8">
      <div className="bg-parchment rounded-xl p-8 lg:p-16 space-y-12 border border-clay/5 shadow-inner">
        {/* Section heading */}
        <div className="flex flex-col md:flex-row justify-between items-baseline gap-4">
          <h2
            ref={headingRef}
            className={`text-5xl lg:text-7xl tracking-tighter-extra font-display reveal-hidden ${headingVisible ? 'reveal-visible' : ''}`}
          >
            {title}
          </h2>
        </div>

        {/* Product deck */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {loading && Array.from({ length: 4 }).map((_, k) => (
            <div key={k} className="aspect-[3/4] rounded-xl bg-sand animate-pulse" />
          ))}

          {error && (
            <p className="col-span-4 text-clay font-body text-sm py-8 text-center">
              Could not load products. Please try again.
            </p>
          )}

          {!loading && !error && products.length === 0 && (
            <p className="col-span-4 text-espresso/40 font-body text-sm py-8 text-center">
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
      </div>
    </section>
  )
}
