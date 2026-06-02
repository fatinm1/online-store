import { useReveal } from '../hooks/useReveal'
import { useMagnetic } from '../hooks/useMagnetic'

export default function BrandBand() {
  const [leftRef, leftVisible] = useReveal(0)
  const [rightRef, rightVisible] = useReveal(300)
  const [statsRef, statsVisible] = useReveal(500)
  const [ctaRef, ctaVisible] = useReveal(0)
  const [newsletterRef, newsletterVisible] = useReveal(0)
  const ctaBtnRef = useMagnetic(0.3)

  return (
    <>
      {/* ── Mission section ── */}
      <section className="w-full max-w-[1446px] mx-auto px-4 lg:px-0 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Left: brand message card */}
          <div
            ref={leftRef}
            className={`reveal-from-left bg-espresso text-cream rounded-xl p-8 lg:p-16 flex flex-col justify-center space-y-8 shadow-xl hover:shadow-2xl group reveal-hidden ${leftVisible ? 'reveal-visible' : ''}`}
          >
            <h3 className="text-5xl lg:text-7xl tracking-tighter-extra leading-none font-display group-hover:translate-x-2 transition-transform duration-700">
              Modest dressing, first-class.
            </h3>
            <p className="text-xl opacity-90 leading-relaxed max-w-md font-body">
              Every piece at NUMME is chosen for its structural integrity, material
              longevity, and timeless modest aesthetic. We believe quality and modesty
              are not a compromise.
            </p>
            <div>
              <a
                href="#abayas"
                onClick={(e) => {
                  e.preventDefault()
                  const el = document.querySelector('#abayas')
                  if (el) window.scrollTo({ top: el.offsetTop - 120, behavior: 'smooth' })
                }}
                className="inline-flex items-center gap-4 text-sm uppercase tracking-widest group"
              >
                Explore Collections
                <span className="w-10 h-[1px] bg-cream group-hover:w-16 transition-all duration-500 block" />
              </a>
            </div>
          </div>

          {/* Right: editorial image */}
          <div
            ref={rightRef}
            className={`reveal-from-right rounded-xl overflow-hidden shadow-xl border border-clay/5 bg-parchment reveal-hidden ${rightVisible ? 'reveal-visible' : ''}`}
            style={{ minHeight: '400px' }}
          >
            <img
              src="https://images.pexels.com/photos/8293774/pexels-photo-8293774.jpeg?w=800&h=600&fit=crop"
              alt="NUMME quality"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-[2s] sepia-[0.15]"
            />
          </div>

          {/* Stats bar */}
          <div
            ref={statsRef}
            className={`reveal-from-bottom md:col-span-2 bg-parchment rounded-xl p-8 lg:p-12 border border-clay/5 shadow-inner flex flex-col md:flex-row items-center justify-around gap-12 text-center reveal-hidden ${statsVisible ? 'reveal-visible' : ''}`}
          >
            {[
              { value: '100%', label: 'Handcrafted Pieces' },
              null,
              { value: '500+', label: 'Pieces in Collection' },
              null,
              { value: '3', label: 'Curated Categories' },
            ].map((item, i) =>
              item ? (
                <div key={i} className="space-y-2">
                  <p className="text-4xl font-bold text-clay font-body">{item.value}</p>
                  <p className="text-xs uppercase tracking-[0.2em] opacity-60 font-body">{item.label}</p>
                </div>
              ) : (
                <div key={i} className="h-px w-12 md:h-12 md:w-px bg-clay/20" />
              )
            )}
          </div>
        </div>
      </section>

      {/* ── Floating CTA island ── */}
      <section
        ref={ctaRef}
        className={`w-full max-w-[1446px] mx-auto px-4 lg:px-0 mt-8 reveal-hidden ${ctaVisible ? 'reveal-visible' : ''}`}
      >
        <div className="animation-float bg-parchment rounded-xl p-8 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left border border-clay/5 shadow-lg">
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl tracking-tighter font-display">Refresh your wardrobe.</h2>
            <p className="text-espresso/70 max-w-xl text-lg font-body">
              New pieces added every season. Each item selected for its modest elegance
              and enduring quality.
            </p>
          </div>
          <button
            ref={ctaBtnRef}
            onClick={() => {
              const el = document.querySelector('#abayas')
              if (el) window.scrollTo({ top: el.offsetTop - 120, behavior: 'smooth' })
            }}
            className="w-full md:w-auto h-[70px] px-16 bg-espresso text-cream rounded-2xl uppercase tracking-widest text-sm font-bold shadow-2xl hover:bg-clay hover:scale-105 active:scale-95 transition-all duration-300 font-body"
          >
            Shop Now
          </button>
        </div>
      </section>

      {/* ── Newsletter island ── */}
      <section
        ref={newsletterRef}
        className={`w-full max-w-[1446px] mx-auto px-4 lg:px-0 mt-8 reveal-hidden ${newsletterVisible ? 'reveal-visible' : ''}`}
      >
        <div className="bg-parchment rounded-xl p-8 lg:p-16 text-center space-y-8 border border-clay/5 shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-4">
            <h3 className="text-sm uppercase tracking-widest font-bold text-clay opacity-60 font-body">
              Join the Archive
            </h3>
            <h2 className="text-4xl lg:text-6xl tracking-tighter-extra font-display">
              New arrivals, straight to your inbox.
            </h2>
            <form
              className="flex flex-col sm:flex-row gap-4 mt-12"
              onSubmit={(e) => { e.preventDefault(); alert('Welcome to the NUMME Archive.') }}
            >
              <input
                type="email"
                placeholder="YOUR@EMAIL.COM"
                required
                className="flex-grow bg-cream border border-clay/20 rounded-xl px-8 py-5 focus:outline-none focus:ring-2 focus:ring-clay focus:border-transparent text-sm tracking-widest font-body transition-all shadow-sm"
              />
              <button
                type="submit"
                className="bg-espresso text-cream px-12 py-5 rounded-xl uppercase tracking-widest text-sm font-bold hover:bg-clay hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl font-body"
              >
                Subscribe
              </button>
            </form>
            <p className="text-[10px] uppercase tracking-widest opacity-40 pt-4 font-body">
              By subscribing you agree to our privacy policy and terms of service.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
