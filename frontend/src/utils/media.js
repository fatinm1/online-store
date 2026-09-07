const API_BASE = import.meta.env.VITE_API_BASE || ''

// Uploaded product images are stored as backend-relative paths
// (/uploads/<file>). In dev the Vite proxy makes that resolve against
// the same origin, but in production the frontend (Vercel) and backend
// (Railway) are on different domains, so a bare relative path 404s
// silently and the <img> renders as nothing. Absolute URLs (seed data
// pulled from Pexels, etc.) are left untouched.
export function resolveImageUrl(url) {
  if (!url) return url
  if (/^https?:\/\//i.test(url)) return url
  return `${API_BASE}${url}`
}
