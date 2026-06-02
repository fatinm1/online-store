import { useState, useEffect } from 'react'
import { adminApi } from '../api/admin'

function formatPrice(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

const STATUSES = ['pending', 'paid', 'failed', 'fulfilled']
const STATUS_COLORS = {
  pending: 'bg-sand text-clay',
  paid: 'bg-gold/20 text-espresso',
  failed: 'bg-red-100 text-red-700',
  fulfilled: 'bg-green-100 text-green-800',
}

export default function OrdersTable() {
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [page, setPage] = useState(1)

  const load = () => {
    setLoading(true)
    const params = { page, per_page: 20 }
    if (statusFilter) params.status = statusFilter
    adminApi.getOrders(params)
      .then((data) => { setOrders(data.orders); setTotal(data.total) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [statusFilter, page])

  const handleStatusUpdate = async (orderId, status) => {
    try {
      const updated = await adminApi.updateOrderStatus(orderId, status)
      setOrders((prev) => prev.map((o) => o.id === orderId ? updated : o))
      if (selected?.id === orderId) setSelected(updated)
    } catch (e) {
      alert(e.message)
    }
  }

  if (selected) {
    return (
      <div>
        <button onClick={() => setSelected(null)} className="font-body text-sm text-clay hover:text-espresso mb-6">
          Back to Orders
        </button>
        <h1 className="font-display text-xl text-espresso mb-5">Order Detail</h1>
        <div className="bg-parchment rounded-2xl p-6 max-w-xl space-y-4">
          <div className="flex justify-between">
            <span className="font-body text-sm text-clay">Order ID</span>
            <span className="font-body text-sm text-espresso font-mono">{selected.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-body text-sm text-clay">Email</span>
            <span className="font-body text-sm text-espresso">{selected.customer_email || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-body text-sm text-clay">Amount</span>
            <span className="font-body text-sm text-espresso">{formatPrice(selected.amount_cents)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-clay">Status</span>
            <select
              value={selected.status}
              onChange={(e) => handleStatusUpdate(selected.id, e.target.value)}
              className="border border-sand rounded-xl px-3 py-1 font-body text-sm text-espresso bg-cream focus:outline-none"
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <p className="font-body text-sm text-clay mb-2">Items</p>
            {selected.items?.map((item) => (
              <div key={item.id} className="flex justify-between py-1">
                <span className="font-body text-sm text-espresso">{item.product_name} x{item.quantity}</span>
                <span className="font-body text-sm text-clay">{formatPrice(item.unit_price_cents * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="font-display text-xl text-espresso">Orders</h1>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="border border-sand rounded-xl px-3 py-2 font-body text-sm text-espresso bg-cream focus:outline-none"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {error && <p className="font-body text-red-600 mb-4">{error}</p>}
      {loading ? (
        <p className="font-body text-clay/60 text-sm">Loading...</p>
      ) : (
        <div className="bg-parchment rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sand">
                <th className="text-left font-body text-xs text-clay/60 px-4 py-3">Email</th>
                <th className="text-left font-body text-xs text-clay/60 px-4 py-3">Amount</th>
                <th className="text-left font-body text-xs text-clay/60 px-4 py-3">Status</th>
                <th className="text-left font-body text-xs text-clay/60 px-4 py-3">Date</th>
                <th className="text-right font-body text-xs text-clay/60 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-sand/50 last:border-0">
                  <td className="px-4 py-3 font-body text-sm text-espresso">{o.customer_email || 'Guest'}</td>
                  <td className="px-4 py-3 font-body text-sm text-espresso">{formatPrice(o.amount_cents)}</td>
                  <td className="px-4 py-3">
                    <span className={`font-body text-xs px-2 py-1 rounded-full ${STATUS_COLORS[o.status] || ''}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-body text-xs text-clay">
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setSelected(o)} className="font-body text-xs text-clay hover:text-espresso">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="text-center font-body text-sm text-clay/60 py-8">No orders found.</p>}
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mt-4 font-body text-sm text-clay">
        <span>{total} total</span>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded-lg bg-sand disabled:opacity-40">Prev</button>
          <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded-lg bg-sand disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  )
}
