export default function Footer() {
  return (
    <footer className="w-full max-w-[1446px] mx-auto px-4 lg:px-0 py-16">
      <div className="bg-parchment rounded-xl p-8 lg:p-16 grid grid-cols-1 md:grid-cols-4 gap-12 border border-clay/5 shadow-sm">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <h2 className="text-3xl tracking-tighter font-display">NUMME</h2>
          <p className="text-espresso/60 max-w-sm font-body">
            Modest luxury clothing for the modern, considered wardrobe. Abayas, thobes,
            and accessories crafted with intention.
          </p>
        </div>
        <div className="space-y-4">
          <h4 className="text-sm uppercase tracking-widest font-bold font-body">Explore</h4>
          <ul className="space-y-2 text-espresso/60 font-body">
            {[
              { href: '#abayas',      label: 'Abaya Edit' },
              { href: '#thobes',      label: 'Thobe Edit' },
              { href: '#accessories', label: 'Accessories' },
            ].map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={(e) => {
                    e.preventDefault()
                    const el = document.querySelector(href)
                    if (el) window.scrollTo({ top: el.offsetTop - 120, behavior: 'smooth' })
                  }}
                  className="hover:text-clay hover:pl-2 transition-all"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4">
          <h4 className="text-sm uppercase tracking-widest font-bold font-body">Connect</h4>
          <ul className="space-y-2 text-espresso/60 font-body">
            {['Instagram', 'TikTok', 'Newsletter', 'Contact'].map((item) => (
              <li key={item}>
                <a href="#" className="hover:text-clay hover:pl-2 transition-all">{item}</a>
              </li>
            ))}
            <li>
              <a href="/admin" className="hover:text-clay hover:pl-2 transition-all text-xs opacity-50">
                Admin
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-8 text-center text-xs text-espresso/40 uppercase tracking-widest font-body">
        &copy; 2025 NUMME. All Rights Reserved.
      </div>
    </footer>
  )
}
