import { useState, useEffect } from 'react'
import { api } from '../api/client'
import ProductCard from './ProductCard'

export default function ProductGrid({ category, title, id }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getProducts(category)
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [category])

  return (
    <section id={id} className="px-4 mb-16">
      <h2 className="font-display text-3xl text-espresso mb-8">{title}</h2>
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((k) => (
            <div key={k} className="bg-parchment rounded-2xl aspect-[3/4] animate-pulse" />
          ))}
        </div>
      )}
      {error && (
        <p className="text-clay font-body text-sm py-8 text-center">
          Could not load products. Please try again.
        </p>
      )}
      {!loading && !error && products.length === 0 && (
        <p className="text-clay/60 font-body text-sm py-8 text-center">
          No items available right now.
        </p>
      )}
      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  )
}
