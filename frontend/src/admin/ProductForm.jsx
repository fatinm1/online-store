import { useState } from 'react'
import { adminApi } from '../api/admin'
import ImageUploader from './ImageUploader'

const CATEGORIES = ['abaya', 'thobe', 'accessory']

const inputClass = 'w-full bg-charcoal border border-iron text-ivory font-body text-sm px-4 py-3 focus:outline-none focus:border-accent'
const labelClass = 'block font-body text-xs uppercase tracking-widest text-mist mb-2'

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

  // A freshly-created (not pre-existing) product that now has an id: the
  // form stays open so the admin can attach an image before returning to
  // the list, since the image upload endpoint requires a product id.
  const justCreated = !isEdit && Boolean(savedId)

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
      if (savedId) {
        saved = await adminApi.updateProduct(savedId, payload)
      } else {
        saved = await adminApi.createProduct(payload)
        setSavedId(saved.id)
      }
      setImageUrl(saved.image_url || '')
      if (isEdit) {
        onSaved(saved)
      }
      // On a fresh create, stay on the form so the image uploader (now
      // available since the product has an id) can be used right away.
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <div>
        <label className={labelClass}>Name</label>
        <input value={form.name} onChange={update('name')} required className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Category</label>
        <select value={form.category} onChange={update('category')} className={inputClass}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
      </div>
      <div>
        <label className={labelClass}>Description</label>
        <textarea value={form.description} onChange={update('description')} rows={3} className={`${inputClass} resize-none`} />
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Price (USD)</label>
          <input type="number" min="0.01" step="0.01" value={form.price_dollars} onChange={update('price_dollars')} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Stock</label>
          <input type="number" min="0" value={form.stock} onChange={update('stock')} required className={inputClass} />
        </div>
      </div>
      <label className="flex items-center gap-3 font-body text-sm text-pearl cursor-pointer">
        <input type="checkbox" checked={form.active} onChange={update('active')} />
        Active (visible on storefront)
      </label>

      {savedId && (
        <div>
          <p className={labelClass}>Product Image</p>
          <ImageUploader productId={savedId} currentUrl={imageUrl} onUploaded={(url) => setImageUrl(url)} />
        </div>
      )}

      {justCreated && (
        <p className="font-body text-xs text-accent">
          Product created. Add a photo above, then click Done.
        </p>
      )}

      {error && <p className="font-body text-sm text-red-400">{error}</p>}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-ivory text-obsidian px-6 py-3 font-body text-xs uppercase tracking-widest disabled:opacity-50 hover:bg-accent transition-colors duration-300"
        >
          {saving ? 'Saving...' : savedId ? 'Save Changes' : 'Create Product'}
        </button>
        <button
          type="button"
          onClick={() => (justCreated ? onSaved({ id: savedId, ...form, image_url: imageUrl }) : onCancel())}
          className="border border-iron text-pearl px-6 py-3 font-body text-xs uppercase tracking-widest hover:border-accent hover:text-accent transition-colors"
        >
          {justCreated ? 'Done' : 'Cancel'}
        </button>
      </div>
    </form>
  )
}
