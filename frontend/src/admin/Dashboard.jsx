import { useState, useEffect } from 'react'
import { adminApi } from '../api/admin'

function formatPrice(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

function StatCard({ label, value }) {
  return (
    <div className="bg-onyx border border-iron p-5">
      <p className="font-body text-xs uppercase tracking-widest text-mist mb-2">{label}</p>
      <p className="font-display text-2xl text-ivory font-light">{value}</p>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    adminApi.getStats()
      .then(setStats)
      .catch((e) => setError(e.message))
  }, [])

  if (error) return <p className="font-body text-red-400">{error}</p>
  if (!stats) return <p className="font-body text-mist">Loading...</p>

  const counts = stats.order_counts || {}

  return (
    <div>
      <h1 className="font-display text-2xl text-ivory font-light mb-8">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Revenue" value={formatPrice(stats.total_revenue_cents)} />
        <StatCard label="Paid Orders" value={counts.paid || 0} />
        <StatCard label="Pending" value={counts.pending || 0} />
        <StatCard label="Fulfilled" value={counts.fulfilled || 0} />
      </div>
      <div>
        <h2 className="font-body text-xs uppercase tracking-widest text-mist mb-4">Low Stock</h2>
        {stats.low_stock.length === 0 ? (
          <p className="font-body text-sm text-mist">All products well stocked.</p>
        ) : (
          <div className="bg-onyx border border-iron">
            {stats.low_stock.map((p, i) => (
              <div
                key={p.id}
                className={`flex justify-between items-center px-5 py-3.5 ${i !== stats.low_stock.length - 1 ? 'border-b border-iron' : ''}`}
              >
                <span className="font-body text-sm text-ivory">{p.name}</span>
                <span className="font-body text-sm text-accent">{p.stock} remaining</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
