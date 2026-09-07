import { vi, test, expect, beforeEach, describe } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'

// Must be hoisted: replaces api for CartContext and this file alike
vi.mock('../api/client', () => ({
  api: {
    getProducts: vi.fn(),
    getProduct: vi.fn(),
    createPaymentIntent: vi.fn(),
  },
}))

import { CartProvider, useCart } from '../context/CartContext'
import { api } from '../api/client'

const LIVE_A = {
  id: 'a1', name: 'Live Abaya', price_cents: 12000,
  image_url: '', in_stock: true, category: 'abaya',
}
const LIVE_A_UPDATED = { ...LIVE_A, name: 'Live Abaya v2', price_cents: 13500 }
const OUT_OF_STOCK_B = {
  id: 'b2', name: 'Out Thobe', price_cents: 8000,
  image_url: '', in_stock: false, category: 'thobe',
}

function CartDisplay() {
  const { items, addItem, totalItems } = useCart()
  return (
    <div>
      <button onClick={() => addItem(LIVE_A)} data-testid="add">Add A</button>
      <span data-testid="count">{totalItems}</span>
      <span data-testid="ids">{JSON.stringify(items.map((i) => i.product.id))}</span>
      <span data-testid="price0">{items[0]?.product.price_cents ?? 'none'}</span>
      <span data-testid="name0">{items[0]?.product.name ?? 'none'}</span>
    </div>
  )
}

describe('Cart localStorage persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: catalog returns nothing (overridden per test as needed)
    api.getProducts.mockResolvedValue([])
  })

  test('empty localStorage starts with an empty cart and skips API call', async () => {
    render(<CartProvider><CartDisplay /></CartProvider>)
    expect(screen.getByTestId('count').textContent).toBe('0')
    // Validation effect exits early — no API call needed
    await waitFor(() => expect(api.getProducts).not.toHaveBeenCalled())
  })

  test('adds item and saves it to localStorage', async () => {
    render(<CartProvider><CartDisplay /></CartProvider>)
    fireEvent.click(screen.getByTestId('add'))
    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('numme_cart') || '[]')
      expect(stored).toHaveLength(1)
      expect(stored[0].product.id).toBe('a1')
      expect(stored[0].quantity).toBe(1)
    })
  })

  test('loads stored items synchronously on mount', async () => {
    localStorage.setItem('numme_cart', JSON.stringify([{ product: LIVE_A, quantity: 3 }]))
    api.getProducts.mockResolvedValue([LIVE_A])
    render(<CartProvider><CartDisplay /></CartProvider>)
    // Synchronous initial load — count is visible before the async validation resolves
    expect(screen.getByTestId('count').textContent).toBe('3')
    // Let the async validation settle to avoid act() warnings
    await waitFor(() => expect(api.getProducts).toHaveBeenCalled())
  })

  test('validation drops out-of-stock items', async () => {
    localStorage.setItem('numme_cart', JSON.stringify([{ product: OUT_OF_STOCK_B, quantity: 1 }]))
    api.getProducts.mockResolvedValue([OUT_OF_STOCK_B])
    render(<CartProvider><CartDisplay /></CartProvider>)
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('0'))
  })

  test('validation drops items not in the live catalog (deleted / deactivated)', async () => {
    const deletedProduct = { id: 'gone', name: 'Gone', price_cents: 5000, image_url: '', in_stock: true }
    localStorage.setItem('numme_cart', JSON.stringify([{ product: deletedProduct, quantity: 2 }]))
    // Catalog does not contain the deleted product
    api.getProducts.mockResolvedValue([LIVE_A])
    render(<CartProvider><CartDisplay /></CartProvider>)
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('0'))
  })

  test('validation refreshes stale name and price from live catalog', async () => {
    const stale = { ...LIVE_A, name: 'Old Name', price_cents: 999 }
    localStorage.setItem('numme_cart', JSON.stringify([{ product: stale, quantity: 1 }]))
    api.getProducts.mockResolvedValue([LIVE_A_UPDATED])
    render(<CartProvider><CartDisplay /></CartProvider>)
    await waitFor(() => {
      expect(screen.getByTestId('price0').textContent).toBe('13500')
      expect(screen.getByTestId('name0').textContent).toBe('Live Abaya v2')
    })
  })

  test('corrupted localStorage value resets to empty cart', () => {
    localStorage.setItem('numme_cart', '{{not valid json')
    render(<CartProvider><CartDisplay /></CartProvider>)
    expect(screen.getByTestId('count').textContent).toBe('0')
    // No items to validate — API is not called
    expect(api.getProducts).not.toHaveBeenCalled()
  })

  test('non-array localStorage value resets to empty cart', () => {
    localStorage.setItem('numme_cart', JSON.stringify({ product: LIVE_A, quantity: 1 }))
    render(<CartProvider><CartDisplay /></CartProvider>)
    expect(screen.getByTestId('count').textContent).toBe('0')
  })

  test('API failure keeps stored items for display convenience', async () => {
    localStorage.setItem('numme_cart', JSON.stringify([{ product: LIVE_A, quantity: 2 }]))
    api.getProducts.mockRejectedValue(new Error('Network error'))
    render(<CartProvider><CartDisplay /></CartProvider>)
    // Initial state from localStorage
    expect(screen.getByTestId('count').textContent).toBe('2')
    // After the failed API call, items are unchanged
    await waitFor(() => expect(api.getProducts).toHaveBeenCalled())
    expect(screen.getByTestId('count').textContent).toBe('2')
  })

  test('validated cart is written back to localStorage', async () => {
    // Store an item that will pass validation
    localStorage.setItem('numme_cart', JSON.stringify([
      { product: LIVE_A, quantity: 1 },
      { product: OUT_OF_STOCK_B, quantity: 1 },
    ]))
    api.getProducts.mockResolvedValue([LIVE_A, OUT_OF_STOCK_B])
    render(<CartProvider><CartDisplay /></CartProvider>)
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('1'))
    const stored = JSON.parse(localStorage.getItem('numme_cart') || '[]')
    expect(stored).toHaveLength(1)
    expect(stored[0].product.id).toBe('a1')
  })
})
