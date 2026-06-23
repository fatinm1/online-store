import { useState } from 'react'
import { useReveal } from '../hooks/useReveal'

const CONTACT_ITEMS = [
  { label: 'Email', value: 'hello@numme.com', href: 'mailto:hello@numme.com' },
  { label: 'WhatsApp', value: '+44 7700 000 000', href: '#' },
  { label: 'Instagram', value: '@numme', href: '#' },
  { label: 'Hours', value: 'Mon – Fri, 9am – 6pm (GMT+3)', href: null },
]

export default function Contact() {
  const [headRef, headVisible] = useReveal(0)
  const [formRef, formVisible] = useReveal(200)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
      {/* Page header */}
      <div
        ref={headRef}
        className={`mb-20 reveal-hidden ${headVisible ? 'reveal-visible' : ''}`}
      >
        <p className="font-script text-accent text-5xl leading-none mb-1">Get in Touch</p>
        <h1 className="font-display text-6xl lg:text-8xl text-ivory font-light leading-none">
          Contact
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-28 border-t border-iron pt-16">
        {/* Contact info */}
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="font-display text-2xl text-ivory font-light">Customer Care</h2>
            <p className="text-pearl font-body text-sm leading-relaxed max-w-sm">
              Our team is available Monday to Friday, 9am – 6pm (GMT+3).
              We aim to respond to all enquiries within 24 hours.
            </p>
          </div>

          <div className="space-y-5">
            {CONTACT_ITEMS.map(({ label, value, href }) => (
              <div key={label} className="flex gap-6 items-start border-b border-iron/40 pb-5">
                <span className="font-body text-[11px] uppercase tracking-widest text-mist w-20 flex-shrink-0 pt-0.5">
                  {label}
                </span>
                {href ? (
                  <a
                    href={href}
                    className="text-ivory font-body text-sm hover:text-accent transition-colors"
                  >
                    {value}
                  </a>
                ) : (
                  <span className="text-pearl font-body text-sm">{value}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact form */}
        <div
          ref={formRef}
          className={`reveal-hidden ${formVisible ? 'reveal-visible' : ''}`}
        >
          {submitted ? (
            <div className="border border-iron/60 p-10 text-center space-y-4">
              <div className="w-12 h-12 border border-accent/40 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="font-display text-2xl text-ivory font-light">Message sent.</h3>
              <p className="text-pearl font-body text-sm">We'll be in touch within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-body text-[11px] uppercase tracking-widest text-mist mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-transparent border border-iron text-ivory font-body text-sm px-4 py-3 focus:outline-none focus:border-accent placeholder:text-mist/50"
                    placeholder="Fatima"
                  />
                </div>
                <div>
                  <label className="block font-body text-[11px] uppercase tracking-widest text-mist mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-transparent border border-iron text-ivory font-body text-sm px-4 py-3 focus:outline-none focus:border-accent placeholder:text-mist/50"
                    placeholder="Al-Rashid"
                  />
                </div>
              </div>

              <div>
                <label className="block font-body text-[11px] uppercase tracking-widest text-mist mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full bg-transparent border border-iron text-ivory font-body text-sm px-4 py-3 focus:outline-none focus:border-accent placeholder:text-mist/50"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block font-body text-[11px] uppercase tracking-widest text-mist mb-2">
                  Order Number (optional)
                </label>
                <input
                  type="text"
                  className="w-full bg-transparent border border-iron text-ivory font-body text-sm px-4 py-3 focus:outline-none focus:border-accent placeholder:text-mist/50"
                  placeholder="#00123"
                />
              </div>

              <div>
                <label className="block font-body text-[11px] uppercase tracking-widest text-mist mb-2">
                  Message
                </label>
                <textarea
                  required
                  rows={5}
                  className="w-full bg-transparent border border-iron text-ivory font-body text-sm px-4 py-3 focus:outline-none focus:border-accent resize-none placeholder:text-mist/50"
                  placeholder="How can we help you?"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-ivory text-obsidian font-body text-xs uppercase tracking-widest py-4 hover:bg-accent transition-colors duration-300"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
