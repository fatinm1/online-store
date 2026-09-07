import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { api } from '../api/client'

const STORAGE_KEY = 'numme_cart'
const CartContext = createContext(null)

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    // Corrupted value — reset to empty rather than crash
    return []
  }
}

function saveToStorage(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Storage unavailable or quota exceeded — fail silently
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => loadFromStorage())

  // On mount: re-validate stored items against the live catalog.
  // Drops items that no longer exist, are inactive, or are out of stock.
  // Refreshes names and prices from the server so stale data is never shown.
  useEffect(() => {
    const stored = loadFromStorage()
    if (stored.length === 0) return
    api.getProducts()
      .then((catalog) => {
        const liveMap = new Map(catalog.map((p) => [p.id, p]))
        const validated = stored
          .filter((item) => {
            const live = liveMap.get(item.product?.id)
            return live && live.in_stock
          })
          .map((item) => ({
            ...item,
            product: { ...item.product, ...liveMap.get(item.product.id) },
          }))
        setItems(validated)
      })
      .catch(() => {
        // Network unavailable — keep stored cart as display-only convenience.
        // The server always recomputes the real total at checkout.
      })
  }, [])

  // Persist to localStorage whenever the cart changes.
  useEffect(() => {
    saveToStorage(items)
  }, [items])

  const addItem = useCallback((product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }, [])

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId))
    } else {
      setItems((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
      )
    }
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const displayTotal = items.reduce((sum, i) => sum + i.product.price_cents * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, displayTotal }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
