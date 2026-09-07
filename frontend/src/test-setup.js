import '@testing-library/jest-dom'

// jsdom in Vitest 2.x may not expose a fully-spec-compliant localStorage.
// Replace it with a plain in-memory implementation so tests can rely on
// getItem / setItem / removeItem / clear without worrying about the runtime.
const makeLocalStorage = () => {
  let store = Object.create(null)
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, val) => { store[key] = String(val) },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = Object.create(null) },
    get length() { return Object.keys(store).length },
    key: (i) => Object.keys(store)[i] ?? null,
  }
}

const localStorageMock = makeLocalStorage()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
})

beforeEach(() => {
  localStorageMock.clear()
})
