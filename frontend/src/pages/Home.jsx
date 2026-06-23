import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useReveal, useSectionReveal } from '../hooks/useReveal'
import ProductCard from '../components/ProductCard'

// ─── Swap these image URLs for your own brand photography ────────────────────
const HERO_IMAGE =
  'https://images.pexels.com/photos/5973776/pexels-photo-5973776.jpeg?w=1600&h=900&fit=crop'
const BRAND_STORY_IMAGE =
  'https://images.pexels.com/photos/3622608/pexels-photo-3622608.jpeg?w=900&h=1200&fit=crop'

const COLLECTION_CIRCLES = [
  {
    label: 'Abayas',
    to: '/abayas',
    img: 'https://images.pexels.com/photos/13838842/pexels-photo-13838842.jpeg?w=400&h=400&fit=crop',
  },
  {
    label: 'Thobes',
    to: '/thobes',
    img: 'https://images.pexels.com/photos/8164508/pexels-photo-8164508.jpeg?w=400&h=400&fit=crop',
  },
  {
    label: 'Accessories',
    to: '/accessories',
    img: 'https://images.pexels.com/photos/34365839/pexels-photo-34365839.jpeg?w=400&h=400&fit=crop',
  },
]

// ─── Brand story copy — edit freely ─────────────────────────────────────────
const BRAND_STORY_BODY = [
  `NUMME was born from a simple conviction: that modest clothing can be as refined,
   luxurious, and thoughtfully crafted as any high-fashion piece. We work with skilled
   artisans to create garments that honour both tradition and contemporary elegance.`,
  `Every piece in our collection is selected for its structural integrity, material
   longevity, and timeless aesthetic. Quality and modesty are not a compromise —
   they are a natural expression of deeply held values.`,
]

// ─── Hero ────────────────────────────────────────────────────────────────────
function Hero() {
  const [ref, visible] = useReveal(100)
  return (
    <section className="relative min-h-[85vh] flex items-end overflow-hidden">
      {/* Background */}
      <img
        src={HERO_IMAGE}
        alt="NUMME Collection"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/50 to-obsidian/10" />

      {/* Content */}
      <div
        ref={ref}
        className={`relative z-10 w-full max-w-[1440px] mx-auto px-6 lg:px-12 pb-16 lg:pb-24 reveal-hidden ${visible ? 'reveal-visible' : ''}`}
      >
        <p className="font-script text-accent text-4xl lg:text-5xl mb-1 leading-none">
          New Collection
        </p>
        <h1 className="font-display font-light text-ivory leading-[0.88] tracking-tight text-[clamp(3.5rem,8vw,7rem)] mb-7">
          Dressed in<br />
          <em className="text-accent not-italic">silence.</em>
        </h1>
        <p className="text-pearl font-body max-w-sm text-sm lg:text-base leading-relaxed mb-10">
          Modest luxury for those who believe faith and elegance belong together.
          Abayas, thobes, and accessories crafted with intention.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/products"
            className="px-10 py-3.5 bg-ivory text-obsidian font-body text-xs uppercase tracking-widest hover:bg-accent transition-colors duration-300"
          >
            Shop Now
          </Link>
          <Link
            to="/abayas"
            className="px-10 py-3.5 border border-ivory/30 text-ivory font-body text-xs uppercase tracking-widest hover:border-accent hover:text-accent transition-colors duration-300"
          >
            New Arrivals
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Collection circles ───────────────────────────────────────────────────────
function CollectionCircles() {
  const [ref, visible] = useReveal(0)
  return (
    <section
      ref={ref}
      className={`max-w-[1440px] mx-auto px-6 lg:px-12 py-20 reveal-hidden ${visible ? 'reveal-visible' : ''}`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-center gap-12 sm:gap-16 lg:gap-24">
        {COLLECTION_CIRCLES.map(({ label, to, img }, i) => (
          <Link
            key={to}
            to={to}
            className="circle-card group flex flex-col items-center gap-4 text-center"
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <div className="w-36 h-36 sm:w-44 sm:h-44 lg:w-52 lg:h-52 rounded-full overflow-hidden border border-iron group-hover:border-accent/40 transition-colors duration-500">
              <img
                src={img}
                alt={label}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </div>
            <span className="circle-label font-body text-xs uppercase tracking-widest text-pearl block">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

// ─── Our Collections (featured product grid) ──────────────────────────────────
function OurCollections() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [gridRef, deckVisible] = useSectionReveal()
  const [headRef, headVisible] = useReveal(0)

  useEffect(() => {
    api.getProducts()
      .then((all) => setProducts(all.slice(0, 4)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="max-w-[1440px] mx-auto px-6 lg:px-12 py-20 border-t border-iron">
      {/* Section header */}
      <div
        ref={headRef}
        className={`flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4 reveal-hidden ${headVisible ? 'reveal-visible' : ''}`}
      >
        <div>
          <p className="font-script text-accent text-4xl leading-none mb-1">Our</p>
          <h2 className="font-display text-5xl lg:text-6xl text-ivory font-light leading-none">Collections</h2>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-3 text-pearl hover:text-ivory font-body text-xs uppercase tracking-widest transition-colors group"
        >
          View All
          <span className="block w-8 h-[1px] bg-current group-hover:w-12 transition-all duration-300" />
        </Link>
      </div>

      {/* Grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8"
      >
        {loading
          ? Array.from({ length: 4 }).map((_, k) => (
              <div key={k} className="aspect-[3/4] bg-charcoal animate-pulse" />
            ))
          : products.map((p, idx) => (
              <ProductCard key={p.id} product={p} deckVisible={deckVisible} deckIndex={idx} />
            ))}
      </div>
    </section>
  )
}

// ─── Brand story ──────────────────────────────────────────────────────────────
function BrandStory() {
  const [textRef, textVisible] = useReveal(0)
  const [imgRef, imgVisible] = useReveal(200)

  return (
    <section className="max-w-[1440px] mx-auto px-6 lg:px-12 py-20 border-t border-iron">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

        {/* Text */}
        <div
          ref={textRef}
          className={`space-y-8 reveal-from-left reveal-hidden ${textVisible ? 'reveal-visible' : ''}`}
        >
          <div>
            <p className="font-script text-accent text-4xl leading-none mb-2">Our Story</p>
            <h2 className="font-display text-5xl lg:text-6xl text-ivory font-light leading-tight">
              Modest dressing,<br />first class.
            </h2>
          </div>
          {BRAND_STORY_BODY.map((para, i) => (
            <p key={i} className="text-pearl font-body text-sm lg:text-base leading-relaxed">
              {para}
            </p>
          ))}
          <Link
            to="/products"
            className="inline-flex items-center gap-4 text-ivory font-body text-xs uppercase tracking-widest group"
          >
            Explore the Collection
            <span className="block w-10 h-[1px] bg-ivory group-hover:w-16 transition-all duration-500" />
          </Link>
        </div>

        {/* Image */}
        <div
          ref={imgRef}
          className={`aspect-[3/4] overflow-hidden bg-charcoal reveal-from-right reveal-hidden ${imgVisible ? 'reveal-visible' : ''}`}
        >
          <img
            src={BRAND_STORY_IMAGE}
            alt="NUMME craftsmanship"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-[2.5s]"
          />
        </div>
      </div>
    </section>
  )
}

// ─── New Arrivals (second product row) ────────────────────────────────────────
function NewArrivals() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [gridRef, deckVisible] = useSectionReveal()
  const [headRef, headVisible] = useReveal(0)

  useEffect(() => {
    api.getProducts()
      .then((all) => setProducts(all.slice(4, 8)))
      .finally(() => setLoading(false))
  }, [])

  // Don't render section if all products fit in the first 4
  if (!loading && products.length === 0) return null

  return (
    <section className="max-w-[1440px] mx-auto px-6 lg:px-12 py-20 border-t border-iron">
      <div
        ref={headRef}
        className={`flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4 reveal-hidden ${headVisible ? 'reveal-visible' : ''}`}
      >
        <div>
          <p className="font-script text-accent text-4xl leading-none mb-1">Featured</p>
          <h2 className="font-display text-5xl lg:text-6xl text-ivory font-light leading-none">New Arrivals</h2>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-3 text-pearl hover:text-ivory font-body text-xs uppercase tracking-widest transition-colors group"
        >
          View All →
        </Link>
      </div>

      <div
        ref={gridRef}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8"
      >
        {loading
          ? Array.from({ length: 4 }).map((_, k) => (
              <div key={k} className="aspect-[3/4] bg-charcoal animate-pulse" />
            ))
          : products.map((p, idx) => (
              <ProductCard key={p.id} product={p} deckVisible={deckVisible} deckIndex={idx} />
            ))}
      </div>
    </section>
  )
}

// ─── Home page ────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <Hero />
      <CollectionCircles />
      <OurCollections />
      <BrandStory />
      <NewArrivals />
    </>
  )
}
