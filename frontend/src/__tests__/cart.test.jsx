import { render, screen, fireEvent } from '@testing-library/react'
import { CartProvider, useCart } from '../context/CartContext'

const PRODUCT_A = { id: 'a1', name: 'Abaya One', price_cents: 10000, image_url: '', in_stock: true }
const PRODUCT_B = { id: 'b2', name: 'Thobe Two', price_cents: 15000, image_url: '', in_stock: true }

function CartTester() {
  const { items, addItem, removeItem, updateQuantity, totalItems, displayTotal } = useCart()
  return (
    <div>
      <button onClick={() => addItem(PRODUCT_A)} data-testid="add-a">Add A</button>
      <button onClick={() => addItem(PRODUCT_B)} data-testid="add-b">Add B</button>
      <button onClick={() => removeItem('a1')} data-testid="remove-a">Remove A</button>
      <button onClick={() => updateQuantity('a1', 3)} data-testid="set-a-3">Set A to 3</button>
      <button onClick={() => updateQuantity('a1', 0)} data-testid="set-a-0">Set A to 0</button>
      <span data-testid="count">{totalItems}</span>
      <span data-testid="total">{displayTotal}</span>
      <span data-testid="items">{JSON.stringify(items.map((i) => ({ id: i.product.id, qty: i.quantity })))}</span>
    </div>
  )
}

function wrap() {
  return render(<CartProvider><CartTester /></CartProvider>)
}

test('starts empty', () => {
  wrap()
  expect(screen.getByTestId('count').textContent).toBe('0')
  expect(screen.getByTestId('total').textContent).toBe('0')
})

test('adds item increases count', () => {
  wrap()
  fireEvent.click(screen.getByTestId('add-a'))
  expect(screen.getByTestId('count').textContent).toBe('1')
})

test('adding same item increments quantity', () => {
  wrap()
  fireEvent.click(screen.getByTestId('add-a'))
  fireEvent.click(screen.getByTestId('add-a'))
  expect(screen.getByTestId('count').textContent).toBe('2')
  const items = JSON.parse(screen.getByTestId('items').textContent)
  expect(items).toHaveLength(1)
  expect(items[0].qty).toBe(2)
})

test('remove item removes from cart', () => {
  wrap()
  fireEvent.click(screen.getByTestId('add-a'))
  fireEvent.click(screen.getByTestId('remove-a'))
  expect(screen.getByTestId('count').textContent).toBe('0')
})

test('total is sum of price times quantity', () => {
  wrap()
  fireEvent.click(screen.getByTestId('add-a')) // 10000
  fireEvent.click(screen.getByTestId('add-b')) // 15000
  expect(screen.getByTestId('total').textContent).toBe('25000')
})

test('updateQuantity to 0 removes item', () => {
  wrap()
  fireEvent.click(screen.getByTestId('add-a'))
  fireEvent.click(screen.getByTestId('set-a-0'))
  expect(screen.getByTestId('count').textContent).toBe('0')
})

test('updateQuantity sets exact quantity', () => {
  wrap()
  fireEvent.click(screen.getByTestId('add-a'))
  fireEvent.click(screen.getByTestId('set-a-3'))
  expect(screen.getByTestId('count').textContent).toBe('3')
  expect(screen.getByTestId('total').textContent).toBe('30000')
})
