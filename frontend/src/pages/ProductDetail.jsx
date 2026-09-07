import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useCart } from '../context/CartContext'
import { useReveal } from '../hooks/useReveal'
import { resolveImageUrl } from '../utils/media'

function formatPrice(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

const CATEGORY_ROUTE = { abaya: 'abayas', thobe: 'thobes', accessory: 'accessories' }

export default function ProductDetail() {
  const { slug } = useParams()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [added, setAdded] = useState(false)
  const [contentRef, contentVisible] = useReveal(100)

  useEffect(() => {
    setLoading(true)
    setError(null)
    api.getProduct(slug)
      .then(setProduct)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [slug])

  const handleAdd = () => {
    if (!product) return
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <div className="aspect-[3/4] bg-charcoal animate-pulse" />
          <div className="space-y-6 pt-8">
            <div className="h-4 w-24 bg-charcoal animate-pulse" />
            <div className="h-16 w-3/4 bg-charcoal animate-pulse" />
            <div className="h-8 w-28 bg-charcoal animate-pulse" />
            <div className="space-y-3 pt-4">
              <div className="h-4 w-full bg-charcoal animate-pulse" />
              <div className="h-4 w-5/6 bg-charcoal animate-pulse" />
              <div className="h-4 w-4/6 bg-charcoal animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-32 text-center">
        <p className="font-display text-3xl text-ivory font-light mb-4">Product Not Found</p>
        <p className="text-mist font-body text-sm mb-8">
          This item may no longer be available.
        </p>
        <Link
          to="/products"
          className="inline-block border border-iron text-pearl px-8 py-3 font-body text-xs uppercase tracking-widest hover:border-accent hover:text-accent transition-colors"
        >
          Browse All Products
        </Link>
      </div>
    )
  }

  const categoryRoute = CATEGORY_ROUTE[product.category] || 'products'
  const isAvailable = product.in_stock

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-10 lg:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-mist font-body text-xs uppercase tracking-widest mb-10">
        <Link to="/" className="hover:text-pearl transition-colors">Home</Link>
        <span>/</span>
        <Link to={`/${categoryRoute}`} className="hover:text-pearl transition-colors capitalize">
          {product.category}s
        </Link>
        <span>/</span>
        <span className="text-pearl">{product.name}</span>
      </nav>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">

        {/* Left: image */}
        <div className="aspect-[3/4] overflow-hidden bg-charcoal group">
          {product.image_url ? (
            <img
              src={resolveImageUrl(product.image_url)}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
            />
          ) : (
            <div className="w-full h-full bg-iron flex items-center justify-center">
              <svg className="w-12 h-12 text-mist" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Right: details */}
        <div
          ref={contentRef}
          className={`flex flex-col justify-center space-y-8 reveal-hidden ${contentVisible ? 'reveal-visible' : ''}`}
        >
          <div className="space-y-4">
            <p className="font-body text-[11px] uppercase tracking-widest text-mist capitalize">
              {product.category}
            </p>
            <h1 className="font-display text-4xl lg:text-6xl text-ivory font-light leading-tight">
              {product.name}
            </h1>
            <p className="font-body text-2xl text-accent">{formatPrice(product.price_cents)}</p>
          </div>

          <div className="w-12 h-[1px] bg-iron" />

          <p className="text-pearl font-body text-sm leading-relaxed">
            {product.description}
          </p>

          {/* Add to cart / sold out */}
          {isAvailable ? (
            <button
              onClick={handleAdd}
              className={`w-full lg:w-auto px-14 py-4 font-body text-xs uppercase tracking-widest transition-all duration-300 ${
                added
                  ? 'bg-accent text-obsidian'
                  : 'bg-ivory text-obsidian hover:bg-accent'
              }`}
            >
              {added ? '✓ Added to Cart' : 'Add to Cart'}
            </button>
          ) : (
            <div className="w-full lg:w-auto px-14 py-4 border border-iron text-mist font-body text-xs uppercase tracking-widest text-center">
              Sold Out
            </div>
          )}

          {/* Back link */}
          <Link
            to={`/${categoryRoute}`}
            className="inline-flex items-center gap-3 text-mist hover:text-ivory font-body text-xs uppercase tracking-widest transition-colors group"
          >
            <span className="block w-6 h-[1px] bg-current group-hover:w-10 transition-all duration-300" />
            Back to {product.category}s
          </Link>
        </div>
      </div>
    </div>
  )
}
