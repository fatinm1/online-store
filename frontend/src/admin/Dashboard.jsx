import { useState, useEffect } from 'react'
import { adminApi } from '../api/admin'

function formatPrice(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

function StatCard({ label, value }) {
  return (
    <div className="bg-parchment rounded-2xl p-6">
      <p className="font-body text-sm text-clay/60 mb-1">{label}</p>
      <p className="font-display text-2xl text-espresso">{value}</p>
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

  if (error) return <p className="font-body text-red-600">{error}</p>
  if (!stats) return <p className="font-body text-clay/60">Loading...</p>

  const counts = stats.order_counts || {}

  return (
    <div>
      <h1 className="font-display text-3xl text-espresso mb-8">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Revenue" value={formatPrice(stats.total_revenue_cents)} />
        <StatCard label="Paid Orders" value={counts.paid || 0} />
        <StatCard label="Pending" value={counts.pending || 0} />
        <StatCard label="Fulfilled" value={counts.fulfilled || 0} />
      </div>
      <div>
        <h2 className="font-display text-xl text-espresso mb-4">Low Stock</h2>
        {stats.low_stock.length === 0 ? (
          <p className="font-body text-sm text-clay/60">All products well stocked.</p>
        ) : (
          <div className="space-y-2">
            {stats.low_stock.map((p) => (
              <div key={p.id} className="flex justify-between items-center bg-parchment rounded-xl px-4 py-3">
                <span className="font-body text-sm text-espresso">{p.name}</span>
                <span className="font-body text-sm text-clay">{p.stock} remaining</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
