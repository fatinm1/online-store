import { useState, useEffect } from 'react'
import { adminApi } from '../api/admin'
import ProductForm from './ProductForm'

function formatPrice(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

export default function ProductsTable() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null) // product or 'new'

  const load = () => {
    setLoading(true)
    adminApi.getProducts()
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      await adminApi.deleteProduct(id)
      load()
    } catch (e) {
      alert(e.message)
    }
  }

  const handleSaved = () => {
    setEditing(null)
    load()
  }

  if (editing) {
    return (
      <div>
        <button onClick={() => setEditing(null)} className="font-body text-sm text-clay hover:text-espresso mb-6">
          Back to Products
        </button>
        <h1 className="font-display text-3xl text-espresso mb-8">
          {editing === 'new' ? 'Add Product' : 'Edit Product'}
        </h1>
        <ProductForm
          product={editing === 'new' ? null : editing}
          onSaved={handleSaved}
          onCancel={() => setEditing(null)}
        />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display text-3xl text-espresso">Products</h1>
        <button onClick={() => setEditing('new')} className="bg-espresso hover:bg-clay text-cream px-5 py-2 rounded-xl font-body text-sm transition-colors">
          Add Product
        </button>
      </div>

      {error && <p className="font-body text-red-600 mb-4">{error}</p>}
      {loading ? (
        <p className="font-body text-clay/60 text-sm">Loading...</p>
      ) : (
        <div className="bg-parchment rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sand">
                <th className="text-left font-body text-xs text-clay/60 px-4 py-3">Name</th>
                <th className="text-left font-body text-xs text-clay/60 px-4 py-3">Category</th>
                <th className="text-left font-body text-xs text-clay/60 px-4 py-3">Price</th>
                <th className="text-left font-body text-xs text-clay/60 px-4 py-3">Stock</th>
                <th className="text-left font-body text-xs text-clay/60 px-4 py-3">Status</th>
                <th className="text-right font-body text-xs text-clay/60 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-sand/50 last:border-0">
                  <td className="px-4 py-3 font-body text-sm text-espresso">{p.name}</td>
                  <td className="px-4 py-3 font-body text-xs text-clay capitalize">{p.category}</td>
                  <td className="px-4 py-3 font-body text-sm text-espresso">{formatPrice(p.price_cents)}</td>
                  <td className="px-4 py-3 font-body text-sm text-espresso">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`font-body text-xs px-2 py-1 rounded-full ${p.active ? 'bg-gold/20 text-espresso' : 'bg-sand text-clay/60'}`}>
                      {p.active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => setEditing(p)} className="font-body text-xs text-clay hover:text-espresso">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="font-body text-xs text-red-500 hover:text-red-700">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <p className="text-center font-body text-sm text-clay/60 py-8">No products yet.</p>}
        </div>
      )}
    </div>
  )
}
