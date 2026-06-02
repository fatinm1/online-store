export default function Hero() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-espresso rounded-3xl mx-4 mt-6 mb-12">
      <div className="absolute inset-0 bg-gradient-to-br from-espresso via-espresso/90 to-clay/40" />
      <div className="relative z-10 text-center px-8 py-16">
        <p className="font-body text-gold tracking-[0.3em] text-sm uppercase mb-4">
          Modest Luxury
        </p>
        <h1 className="font-display text-5xl md:text-7xl text-cream leading-tight mb-6">
          Dressed in<br />
          <em className="text-gold">quiet grace</em>
        </h1>
        <p className="font-body text-sand/80 text-lg max-w-md mx-auto mb-10">
          Thoughtfully crafted abayas, thobes, and accessories for the modern modest wardrobe.
        </p>
        <a
          href="#abayas"
          className="inline-block bg-gold hover:bg-clay text-espresso font-body font-medium px-8 py-3 rounded-full transition-colors"
        >
          Explore the Edit
        </a>
      </div>
    </section>
  )
}
