const BASE = import.meta.env.VITE_API_BASE || ''

let csrfToken = ''

export function setCsrfToken(t) {
  csrfToken = t
}

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData
  const headers = {
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    'X-CSRF-Token': csrfToken,
    ...options.headers,
  }
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers,
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw Object.assign(new Error(body.error || 'Request failed'), { status: res.status })
  }
  return res.json()
}

export const adminApi = {
  login: (email, password) =>
    request('/api/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request('/api/admin/logout', { method: 'POST' }),
  me: () => request('/api/admin/me'),

  getProducts: () => request('/api/admin/products'),
  createProduct: (data) =>
    request('/api/admin/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) =>
    request(`/api/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) =>
    request(`/api/admin/products/${id}`, { method: 'DELETE' }),
  uploadImage: (id, file) => {
    const form = new FormData()
    form.append('image', file)
    return request(`/api/admin/products/${id}/image`, { method: 'POST', body: form })
  },

  getOrders: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/api/admin/orders${qs ? '?' + qs : ''}`)
  },
  getOrder: (id) => request(`/api/admin/orders/${id}`),
  updateOrderStatus: (id, status) =>
    request(`/api/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  getStats: () => request('/api/admin/stats'),
}
