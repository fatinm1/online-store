import { useReveal } from '../hooks/useReveal'

export default function StaticPage({ title, script, children }) {
  const [headRef, headVisible] = useReveal(0)

  return (
    <div className="max-w-[860px] mx-auto px-6 lg:px-0 py-16 lg:py-24">
      {/* Header */}
      <div
        ref={headRef}
        className={`mb-16 border-b border-iron pb-12 reveal-hidden ${headVisible ? 'reveal-visible' : ''}`}
      >
        {script && (
          <p className="font-script text-accent text-4xl leading-none mb-1">{script}</p>
        )}
        <h1 className="font-display text-5xl lg:text-7xl text-ivory font-light leading-none">{title}</h1>
      </div>

      {/* Body */}
      <div className="space-y-8 font-body text-pearl text-sm leading-relaxed [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-ivory [&_h2]:font-light [&_h2]:mt-12 [&_h2]:mb-4 [&_strong]:text-ivory [&_strong]:font-medium">
        {children}
      </div>
    </div>
  )
}
