import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { api } from '../api/client'
import { useCart } from '../context/CartContext'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

const STRIPE_APPEARANCE = {
  theme: 'night',
  variables: {
    colorPrimary: '#b8965a',
    colorBackground: '#0f0f0f',
    colorText: '#ede8de',
    colorDanger: '#e57373',
    fontFamily: '"DM Sans", system-ui, sans-serif',
    borderRadius: '0px',
  },
}

function formatPrice(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

function PaymentForm({ amountCents, onSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setProcessing(true)
    setError(null)

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (stripeError) {
      setError(stripeError.message)
      setProcessing(false)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement />
      {error && <p className="text-red-400 text-sm font-body">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-ivory text-obsidian py-3.5 font-body text-xs uppercase tracking-widest disabled:opacity-50 hover:bg-accent transition-colors duration-300"
      >
        {processing ? 'Processing…' : `Pay ${formatPrice(amountCents)}`}
      </button>
    </form>
  )
}

export default function CheckoutModal({ open, onClose }) {
  const { items, clearCart } = useCart()
  const [email, setEmail] = useState('')
  const [clientSecret, setClientSecret] = useState(null)
  const [amountCents, setAmountCents] = useState(0)
  const [loadingIntent, setLoadingIntent] = useState(false)
  const [intentError, setIntentError] = useState(null)
  const [success, setSuccess] = useState(false)

  const startCheckout = async () => {
    setLoadingIntent(true)
    setIntentError(null)
    try {
      const payload = items.map((i) => ({ product_id: i.product.id, quantity: i.quantity }))
      const data = await api.createPaymentIntent(payload, email)
      setClientSecret(data.client_secret)
      setAmountCents(data.amount_cents)
    } catch (e) {
      setIntentError(e.message)
    } finally {
      setLoadingIntent(false)
    }
  }

  const handleSuccess = () => {
    setSuccess(true)
    clearCart()
  }

  const handleClose = () => {
    setClientSecret(null)
    setSuccess(false)
    setEmail('')
    setIntentError(null)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-obsidian/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-onyx border border-iron w-full max-w-md p-8 relative">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-mist hover:text-ivory transition-colors"
          aria-label="Close checkout"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {success ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 border border-accent/40 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="font-display text-2xl text-ivory font-light mb-3">Thank you.</h2>
            <p className="font-body text-pearl text-sm leading-relaxed">
              Your order has been received.
              {email && ` A confirmation will be sent to ${email}.`}
            </p>
            <button
              onClick={handleClose}
              className="mt-8 bg-ivory text-obsidian px-8 py-3 font-body text-xs uppercase tracking-widest hover:bg-accent transition-colors duration-300"
            >
              Continue Shopping
            </button>
          </div>
        ) : !clientSecret ? (
          <div>
            <h2 className="font-display text-2xl text-ivory font-light mb-8">Checkout</h2>
            <label className="block font-body text-xs uppercase tracking-widest text-mist mb-2">
              Email (optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-charcoal border border-iron text-ivory font-body text-sm px-4 py-3 focus:outline-none focus:border-accent mb-6"
            />
            {intentError && (
              <p className="text-red-400 text-sm font-body mb-4">{intentError}</p>
            )}
            <button
              onClick={startCheckout}
              disabled={loadingIntent || items.length === 0}
              className="w-full bg-ivory text-obsidian py-3.5 font-body text-xs uppercase tracking-widest disabled:opacity-50 hover:bg-accent transition-colors duration-300"
            >
              {loadingIntent ? 'Loading…' : 'Continue to Payment'}
            </button>
          </div>
        ) : (
          <div>
            <h2 className="font-display text-2xl text-ivory font-light mb-8">Payment</h2>
            <Elements
              stripe={stripePromise}
              options={{ clientSecret, appearance: STRIPE_APPEARANCE }}
            >
              <PaymentForm amountCents={amountCents} onSuccess={handleSuccess} />
            </Elements>
          </div>
        )}
      </div>
    </div>
  )
}
