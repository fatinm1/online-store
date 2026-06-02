import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { api } from '../api/client'
import { useCart } from '../context/CartContext'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-red-600 text-sm font-body">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-espresso hover:bg-clay disabled:opacity-50 text-cream py-3 rounded-xl font-body transition-colors"
      >
        {processing ? 'Processing...' : `Pay ${formatPrice(amountCents)}`}
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
    <div className="fixed inset-0 bg-espresso/60 z-50 flex items-center justify-center p-4">
      <div className="bg-cream rounded-2xl w-full max-w-md p-8 relative shadow-2xl">
        <button onClick={handleClose} className="absolute top-4 right-4 text-clay hover:text-espresso">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-display text-2xl text-espresso mb-2">Thank you!</h2>
            <p className="font-body text-clay/70 text-sm">Your order has been received. A confirmation will be sent to {email}.</p>
            <button onClick={handleClose} className="mt-6 bg-espresso text-cream px-6 py-2 rounded-xl font-body text-sm">
              Continue Shopping
            </button>
          </div>
        ) : !clientSecret ? (
          <div>
            <h2 className="font-display text-2xl text-espresso mb-6">Checkout</h2>
            <label className="block font-body text-sm text-clay mb-1">Email (optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-sand rounded-xl px-4 py-3 font-body text-sm text-espresso bg-parchment focus:outline-none focus:border-clay mb-4"
            />
            {intentError && <p className="text-red-600 text-sm font-body mb-3">{intentError}</p>}
            <button
              onClick={startCheckout}
              disabled={loadingIntent || items.length === 0}
              className="w-full bg-espresso hover:bg-clay disabled:opacity-50 text-cream py-3 rounded-xl font-body transition-colors"
            >
              {loadingIntent ? 'Loading...' : 'Continue to Payment'}
            </button>
          </div>
        ) : (
          <div>
            <h2 className="font-display text-2xl text-espresso mb-6">Payment</h2>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm amountCents={amountCents} onSuccess={handleSuccess} />
            </Elements>
          </div>
        )}
      </div>
    </div>
  )
}
