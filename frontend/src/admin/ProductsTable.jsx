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
        <button onClick={() => setEditing(null)} className="font-body text-xs uppercase tracking-widest text-mist hover:text-ivory transition-colors mb-8">
          Back to Products
        </button>
        <h1 className="font-display text-2xl text-ivory font-light mb-8">
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
        <h1 className="font-display text-2xl text-ivory font-light">Products</h1>
        <button
          onClick={() => setEditing('new')}
          className="bg-ivory text-obsidian px-5 py-2.5 font-body text-xs uppercase tracking-widest hover:bg-accent transition-colors duration-300"
        >
          Add Product
        </button>
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
                <th className="text-left font-body text-[11px] uppercase tracking-widest text-mist px-5 py-3">Name</th>
                <th className="text-left font-body text-[11px] uppercase tracking-widest text-mist px-5 py-3">Category</th>
                <th className="text-left font-body text-[11px] uppercase tracking-widest text-mist px-5 py-3">Price</th>
                <th className="text-left font-body text-[11px] uppercase tracking-widest text-mist px-5 py-3">Stock</th>
                <th className="text-left font-body text-[11px] uppercase tracking-widest text-mist px-5 py-3">Status</th>
                <th className="text-right font-body text-[11px] uppercase tracking-widest text-mist px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-iron last:border-0">
                  <td className="px-5 py-3.5 font-body text-sm text-ivory">{p.name}</td>
                  <td className="px-5 py-3.5 font-body text-xs text-pearl capitalize">{p.category}</td>
                  <td className="px-5 py-3.5 font-body text-sm text-ivory">{formatPrice(p.price_cents)}</td>
                  <td className="px-5 py-3.5 font-body text-sm text-ivory">{p.stock}</td>
                  <td className="px-5 py-3.5">
                    <span className={`font-body text-[11px] uppercase tracking-widest px-2.5 py-1 ${p.active ? 'bg-accent/15 text-accent' : 'bg-iron text-mist'}`}>
                      {p.active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-4">
                    <button onClick={() => setEditing(p)} className="font-body text-xs uppercase tracking-widest text-pearl hover:text-ivory transition-colors">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="font-body text-xs uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <p className="text-center font-body text-sm text-mist py-8">No products yet.</p>}
          </div>
        </div>
      )}
    </div>
  )
}
