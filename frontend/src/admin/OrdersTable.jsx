import { useState, useEffect } from 'react'
import { adminApi } from '../api/admin'

function formatPrice(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

const STATUSES = ['pending', 'paid', 'failed', 'fulfilled']
const STATUS_COLORS = {
  pending: 'bg-iron text-mist',
  paid: 'bg-accent/15 text-accent',
  failed: 'bg-red-500/15 text-red-400',
  fulfilled: 'bg-accent/15 text-accent',
}

const selectClass = 'bg-charcoal border border-iron text-ivory font-body text-sm px-4 py-2.5 focus:outline-none focus:border-accent'

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
        <button onClick={() => setSelected(null)} className="font-body text-xs uppercase tracking-widest text-mist hover:text-ivory transition-colors mb-8">
          Back to Orders
        </button>
        <h1 className="font-display text-2xl text-ivory font-light mb-8">Order Detail</h1>
        <div className="bg-onyx border border-iron p-6 max-w-xl space-y-4">
          <div className="flex justify-between">
            <span className="font-body text-xs uppercase tracking-widest text-mist">Order ID</span>
            <span className="font-body text-sm text-ivory font-mono">{selected.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-body text-xs uppercase tracking-widest text-mist">Email</span>
            <span className="font-body text-sm text-ivory">{selected.customer_email || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-body text-xs uppercase tracking-widest text-mist">Amount</span>
            <span className="font-body text-sm text-ivory">{formatPrice(selected.amount_cents)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body text-xs uppercase tracking-widest text-mist">Status</span>
            <select
              value={selected.status}
              onChange={(e) => handleStatusUpdate(selected.id, e.target.value)}
              className={selectClass}
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="pt-2 border-t border-iron">
            <p className="font-body text-xs uppercase tracking-widest text-mist mb-3">Items</p>
            {selected.items?.map((item) => (
              <div key={item.id} className="flex justify-between py-1.5">
                <span className="font-body text-sm text-ivory">{item.product_name} x{item.quantity}</span>
                <span className="font-body text-sm text-pearl">{formatPrice(item.unit_price_cents * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display text-2xl text-ivory font-light">Orders</h1>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className={selectClass}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {error && <p className="font-body text-red-400 mb-4">{error}</p>}
      {loading ? (
        <p className="font-body text-mist text-sm">Loading...</p>
      ) : (
        <div className="bg-onyx border border-iron overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-iron">
                <th className="text-left font-body text-[11px] uppercase tracking-widest text-mist px-5 py-3">Email</th>
                <th className="text-left font-body text-[11px] uppercase tracking-widest text-mist px-5 py-3">Amount</th>
                <th className="text-left font-body text-[11px] uppercase tracking-widest text-mist px-5 py-3">Status</th>
                <th className="text-left font-body text-[11px] uppercase tracking-widest text-mist px-5 py-3">Date</th>
                <th className="text-right font-body text-[11px] uppercase tracking-widest text-mist px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-iron last:border-0">
                  <td className="px-5 py-3.5 font-body text-sm text-ivory">{o.customer_email || 'Guest'}</td>
                  <td className="px-5 py-3.5 font-body text-sm text-ivory">{formatPrice(o.amount_cents)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`font-body text-[11px] uppercase tracking-widest px-2.5 py-1 ${STATUS_COLORS[o.status] || ''}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-body text-xs text-pearl">
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => setSelected(o)} className="font-body text-xs uppercase tracking-widest text-pearl hover:text-ivory transition-colors">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="text-center font-body text-sm text-mist py-8">No orders found.</p>}
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mt-5 font-body text-sm text-mist">
        <span>{total} total</span>
        <div className="flex gap-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-1.5 border border-iron text-pearl font-body text-xs uppercase tracking-widest disabled:opacity-30 hover:border-accent hover:text-accent transition-colors"
          >
            Prev
          </button>
          <button
            disabled={page * 20 >= total}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-1.5 border border-iron text-pearl font-body text-xs uppercase tracking-widest disabled:opacity-30 hover:border-accent hover:text-accent transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
