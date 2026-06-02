import { useState } from 'react'
import { adminApi } from '../api/admin'
import ImageUploader from './ImageUploader'

const CATEGORIES = ['abaya', 'thobe', 'accessory']

export default function ProductForm({ product, onSaved, onCancel }) {
  const isEdit = Boolean(product)
  const [form, setForm] = useState({
    name: product?.name || '',
    category: product?.category || 'abaya',
    description: product?.description || '',
    price_dollars: product ? (product.price_cents / 100).toFixed(2) : '',
    stock: product?.stock ?? 0,
    active: product?.active ?? true,
  })
  const [imageUrl, setImageUrl] = useState(product?.image_url || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [savedId, setSavedId] = useState(product?.id || null)

  const update = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [field]: val }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const price_cents = Math.round(parseFloat(form.price_dollars) * 100)
    if (isNaN(price_cents) || price_cents <= 0) {
      setError('Enter a valid price.')
      setSaving(false)
      return
    }
    const payload = {
      name: form.name,
      category: form.category,
      description: form.description,
      price_cents,
      stock: parseInt(form.stock, 10),
      active: form.active,
    }
    try {
      let saved
      if (isEdit) {
        saved = await adminApi.updateProduct(product.id, payload)
      } else {
        saved = await adminApi.createProduct(payload)
        setSavedId(saved.id)
      }
      onSaved(saved)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label className="block font-body text-sm text-clay mb-1">Name</label>
        <input value={form.name} onChange={update('name')} required className="w-full border border-sand rounded-xl px-3 py-2 font-body text-sm text-espresso bg-parchment focus:outline-none focus:border-clay" />
      </div>
      <div>
        <label className="block font-body text-sm text-clay mb-1">Category</label>
        <select value={form.category} onChange={update('category')} className="w-full border border-sand rounded-xl px-3 py-2 font-body text-sm text-espresso bg-parchment focus:outline-none focus:border-clay">
          {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
      </div>
      <div>
        <label className="block font-body text-sm text-clay mb-1">Description</label>
        <textarea value={form.description} onChange={update('description')} rows={3} className="w-full border border-sand rounded-xl px-3 py-2 font-body text-sm text-espresso bg-parchment focus:outline-none focus:border-clay resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-body text-sm text-clay mb-1">Price (USD)</label>
          <input type="number" min="0.01" step="0.01" value={form.price_dollars} onChange={update('price_dollars')} required className="w-full border border-sand rounded-xl px-3 py-2 font-body text-sm text-espresso bg-parchment focus:outline-none focus:border-clay" />
        </div>
        <div>
          <label className="block font-body text-sm text-clay mb-1">Stock</label>
          <input type="number" min="0" value={form.stock} onChange={update('stock')} required className="w-full border border-sand rounded-xl px-3 py-2 font-body text-sm text-espresso bg-parchment focus:outline-none focus:border-clay" />
        </div>
      </div>
      <label className="flex items-center gap-3 font-body text-sm text-clay cursor-pointer">
        <input type="checkbox" checked={form.active} onChange={update('active')} className="rounded" />
        Active (visible on storefront)
      </label>

      {savedId && (
        <div>
          <p className="font-body text-sm text-clay mb-2">Product Image</p>
          <ImageUploader productId={savedId} currentUrl={imageUrl} onUploaded={(url) => setImageUrl(url)} />
        </div>
      )}

      {error && <p className="text-red-600 font-body text-sm">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="bg-espresso hover:bg-clay disabled:opacity-50 text-cream px-4 py-2 rounded-xl font-body text-sm transition-colors">
          {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
        </button>
        <button type="button" onClick={onCancel} className="bg-sand hover:bg-parchment text-espresso px-4 py-2 rounded-xl font-body text-sm transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}
