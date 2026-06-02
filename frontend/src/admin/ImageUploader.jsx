import { useState, useRef } from 'react'
import { adminApi } from '../api/admin'

const ALLOWED = ['image/png', 'image/jpeg', 'image/webp']
const MAX_BYTES = 5 * 1024 * 1024

export default function ImageUploader({ productId, currentUrl, onUploaded }) {
  const [preview, setPreview] = useState(currentUrl || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const handleFile = async (file) => {
    setError(null)
    if (!ALLOWED.includes(file.type)) {
      setError('Only PNG, JPEG, and WEBP are accepted.')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('File must be under 5 MB.')
      return
    }
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const data = await adminApi.uploadImage(productId, file)
      onUploaded(data.image_url)
    } catch (e) {
      setError(e.message)
      setPreview(currentUrl || null)
    } finally {
      setUploading(false)
    }
  }

  const handleChange = (e) => {
    const file = e.target.files[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        className="relative w-full aspect-video bg-sand rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center"
      >
        {preview ? (
          <img src={preview} alt="Product" className="w-full h-full object-cover" />
        ) : (
          <div className="text-clay/40 text-center">
            <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            <p className="font-body text-sm">Upload image</p>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-espresso/40 flex items-center justify-center">
            <p className="text-cream font-body text-sm">Uploading...</p>
          </div>
        )}
      </div>
      {error && <p className="font-body text-xs text-red-600 mt-1">{error}</p>}
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleChange} className="hidden" />
    </div>
  )
}
