import { useRef, useEffect } from 'react'
import { useReveal } from '../hooks/useReveal'
import { useMagnetic } from '../hooks/useMagnetic'

export default function Hero() {
  const [sectionRef, sectionVisible] = useReveal(0)
  const [line1Ref, line1Visible] = useReveal(200)
  const [line2Ref, line2Visible] = useReveal(400)
  const [subtitleRef, subtitleVisible] = useReveal(800)
  const [ctaRef, ctaVisible] = useReveal(1000)
  const heroImgRef = useRef(null)
  const ctaMagRef = useMagnetic(0.3)

  // Parallax scale on scroll — speed matches reference data-parallax-scale="0.3"
  useEffect(() => {
    const onScroll = () => {
      const img = heroImgRef.current
      if (!img) return
      const scroll = window.pageYOffset
      const scale = Math.min(1 + (scroll * 0.3) / 1000, 1.2)
      img.style.transform = `scale(${scale})`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Merge the two refs for the CTA element (magnetic + reveal)
  const setCta = (el) => {
    ctaRef.current = el
    ctaMagRef.current = el
  }

  return (
    <>
      {/* ── Text hero island ── */}
      <section
        ref={sectionRef}
        className={`w-full max-w-[1446px] mx-auto px-4 lg:px-0 mt-8 reveal-hidden ${sectionVisible ? 'reveal-visible' : ''}`}
      >
        <div className="bg-parchment rounded-xl p-8 lg:p-16 flex flex-col lg:flex-row justify-between items-end min-h-[412px] border border-clay/5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-clay/5 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="max-w-4xl space-y-6 relative z-10">
            <h1 className="text-[60px] md:text-[80px] lg:text-[110px] leading-[0.85] lg:leading-[100px] tracking-tighter-extra font-normal font-display">
              <span
                ref={line1Ref}
                className={`inline-block hover:italic transition-all duration-700 reveal-hidden ${line1Visible ? 'reveal-visible' : ''}`}
              >
                Dressed in quiet
              </span>
              <br />
              <span
                ref={line2Ref}
                className={`inline-block hover:italic transition-all duration-700 reveal-hidden ${line2Visible ? 'reveal-visible' : ''}`}
              >
                <em className="text-clay not-italic">grace.</em>
              </span>
            </h1>
            <p
              ref={subtitleRef}
              className={`text-xl md:text-2xl lg:text-[26px] leading-snug tracking-tight max-w-[600px] opacity-80 font-body reveal-hidden ${subtitleVisible ? 'reveal-visible' : ''}`}
            >
              Modest luxury for the modern wardrobe. Abayas, thobes, and accessories
              crafted for those who believe faith and beauty belong together.
            </p>
          </div>

          <div
            ref={ctaRef}
            className={`mt-8 lg:mt-0 lg:mb-4 reveal-hidden ${ctaVisible ? 'reveal-visible' : ''}`}
          >
            <a
              ref={setCta}
              href="#abayas"
              onClick={(e) => {
                e.preventDefault()
                const el = document.querySelector('#abayas')
                if (el) window.scrollTo({ top: el.offsetTop - 120, behavior: 'smooth' })
              }}
              className="inline-flex items-center justify-center w-[200px] h-[50px] bg-espresso text-cream rounded-2xl text-base font-body hover:bg-clay hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl group"
            >
              Explore the Edit
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── Parallax image island ── */}
      <ParallaxHeroImage imgRef={heroImgRef} />
    </>
  )
}

function ParallaxHeroImage({ imgRef }) {
  const [ref, visible] = useReveal(100)
  return (
    <section
      ref={ref}
      className={`w-full max-w-[1446px] mx-auto px-4 lg:px-0 mt-8 reveal-hidden ${visible ? 'reveal-visible' : ''}`}
    >
      <div className="relative rounded-xl overflow-hidden min-h-[400px] lg:min-h-[700px] shadow-2xl">
        <img
          ref={imgRef}
          src="https://images.pexels.com/photos/374677/pexels-photo-374677.jpeg?w=1446&h=700&fit=crop"
          alt="NUMME modest luxury boutique"
          className="w-full h-full object-cover absolute inset-0 transition-transform duration-100 ease-out sepia-[0.15]"
          style={{ willChange: 'transform' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/40 to-transparent" />
        <div className="absolute bottom-12 left-12">
          <span className="bg-cream text-clay px-6 py-3 rounded-full text-xs uppercase tracking-widest font-bold shadow-lg animate-pulse">
            New Collection 2025
          </span>
        </div>
      </div>
    </section>
  )
}
