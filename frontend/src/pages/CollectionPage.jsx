import { useReveal } from '../hooks/useReveal'
import ProductGrid from '../components/ProductGrid'

export default function CollectionPage({ category, title, description }) {
  const [bannerRef, bannerVisible] = useReveal(0)

  return (
    <div>
      {/* Collection banner */}
      <div className="border-b border-iron">
        <div
          ref={bannerRef}
          className={`max-w-[1440px] mx-auto px-6 lg:px-12 py-16 lg:py-24 reveal-hidden ${bannerVisible ? 'reveal-visible' : ''}`}
        >
          <p className="font-script text-accent text-4xl leading-none mb-1">
            {category ? 'The Edit' : 'Everything'}
          </p>
          <h1 className="font-display text-6xl lg:text-8xl text-ivory font-light leading-none mb-6">
            {title}
          </h1>
          {description && (
            <p className="text-pearl font-body text-sm max-w-md leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Products */}
      <ProductGrid category={category} />
    </div>
  )
}
