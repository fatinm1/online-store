export default function Footer() {
  return (
    <footer className="bg-espresso/10 border-t border-sand/40 px-8 py-10 mt-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="font-display text-xl text-espresso tracking-widest">NUMME</span>
        <p className="font-body text-sm text-clay/60">
          Quiet luxury for the modest wardrobe.
        </p>
        <a href="/admin" className="font-body text-xs text-clay/40 hover:text-clay">
          Admin
        </a>
      </div>
    </footer>
  )
}
