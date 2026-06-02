const BASE = import.meta.env.VITE_API_BASE || ''

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw Object.assign(new Error(body.error || 'Request failed'), { status: res.status })
  }
  return res.json()
}

export const api = {
  getProducts: (category) =>
    request(`/api/products${category ? `?category=${category}` : ''}`),
  getProduct: (slug) => request(`/api/products/${slug}`),
  createPaymentIntent: (items, email) =>
    request('/api/checkout/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ items, email }),
    }),
}
