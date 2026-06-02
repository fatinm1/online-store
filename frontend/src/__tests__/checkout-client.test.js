import { vi, test, expect, beforeEach, afterEach } from 'vitest'

let fetchCalls = []

beforeEach(() => {
  fetchCalls = []
  global.fetch = vi.fn(async (url, opts) => {
    fetchCalls.push({ url, opts })
    return {
      ok: true,
      json: async () => ({ client_secret: 'pi_test_secret', amount_cents: 25000, currency: 'usd' }),
    }
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

test('createPaymentIntent sends only product_id and quantity - no price fields', async () => {
  const { api } = await import('../api/client.js')

  await api.createPaymentIntent(
    [{ product_id: 'abc123', quantity: 2 }],
    'buyer@test.com'
  )

  expect(fetchCalls).toHaveLength(1)
  const body = JSON.parse(fetchCalls[0].opts.body)

  // Must have items array
  expect(body.items).toHaveLength(1)
  expect(body.items[0].product_id).toBe('abc123')
  expect(body.items[0].quantity).toBe(2)

  // Must NOT send any price field in items
  expect(body.items[0].price_cents).toBeUndefined()
  expect(body.items[0].price).toBeUndefined()
  expect(body.items[0].amount).toBeUndefined()

  // Top-level price injection must not happen
  expect(body.price_cents).toBeUndefined()
  expect(body.total).toBeUndefined()
})
