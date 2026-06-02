import { useReveal } from '../hooks/useReveal'

const CATEGORIES = [
  {
    id: 'abayas',
    href: '#abayas',
    label: 'The Abaya Edit',
    sub: 'Explore Collection',
    img: 'https://images.pexels.com/photos/7148620/pexels-photo-7148620.jpeg?w=600&h=800&fit=crop',
  },
  {
    id: 'thobes',
    href: '#thobes',
    label: 'The Thobe Edit',
    sub: 'Heritage Tailoring',
    img: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?w=600&h=800&fit=crop',
  },
  {
    id: 'accessories',
    href: '#accessories',
    label: 'Finishing Touches',
    sub: 'Curated Details',
    img: 'https://images.pexels.com/photos/965981/pexels-photo-965981.jpeg?w=600&h=800&fit=crop',
  },
]

export default function CategoryCards() {
  const [ref, visible] = useReveal(0)

  return (
    <section
      ref={ref}
      className={`w-full max-w-[1446px] mx-auto px-4 lg:px-0 mt-8 reveal-hidden ${visible ? 'reveal-visible' : ''}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {CATEGORIES.map(({ id, href, label, sub, img }, i) => (
          <CategoryCard key={id} href={href} label={label} sub={sub} img={img} delay={i * 200} />
        ))}
      </div>
    </section>
  )
}

function CategoryCard({ href, label, sub, img, delay }) {
  const [ref, visible] = useReveal(delay)

  return (
    <a
      ref={ref}
      href={href}
      onClick={(e) => {
        e.preventDefault()
        const el = document.querySelector(href)
        if (el) window.scrollTo({ top: el.offsetTop - 120, behavior: 'smooth' })
      }}
      className={`category-card block bg-parchment rounded-xl overflow-hidden cursor-pointer h-[500px] relative shadow-lg border border-clay/5 reveal-hidden ${visible ? 'reveal-visible' : ''}`}
    >
      <img
        src={img}
        alt={label}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] contrast-[0.9]"
        style={{ transition: 'transform 1.5s ease' }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)' }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
      />
      <div
        className="absolute inset-0 bg-black/30 transition-colors duration-500"
        style={{ transition: 'background-color 0.5s ease' }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.55)' }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.3)' }}
      />
      <div className="absolute bottom-8 left-8 text-cream">
        <h3 className="cat-label text-4xl tracking-tighter font-display">{label}</h3>
        <p className="cat-sub text-sm uppercase tracking-widest mt-2">{sub}</p>
      </div>
    </a>
  )
}
