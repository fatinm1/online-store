import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import Header from './components/Header'
import Hero from './components/Hero'
import ProductGrid from './components/ProductGrid'
import CartDrawer from './components/CartDrawer'
import CheckoutModal from './components/CheckoutModal'
import BrandBand from './components/BrandBand'
import Footer from './components/Footer'
import AdminLayout from './admin/AdminLayout'
import Login from './admin/Login'
import Dashboard from './admin/Dashboard'
import ProductsTable from './admin/ProductsTable'
import OrdersTable from './admin/OrdersTable'

function Storefront() {
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  return (
    <div className="max-w-7xl mx-auto">
      <Header onCartOpen={() => setCartOpen(true)} />
      <Hero />
      <div className="px-0 space-y-4">
        <ProductGrid id="abayas" category="abaya" title="The Abaya Edit" />
        <ProductGrid id="thobes" category="thobe" title="The Thobe Edit" />
        <ProductGrid id="accessories" category="accessory" title="Finishing Touches" />
      </div>
      <BrandBand />
      <Footer />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => { setCartOpen(false); setCheckoutOpen(true) }}
      />
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Storefront />} />
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductsTable />} />
              <Route path="orders" element={<OrdersTable />} />
            </Route>
          </Routes>
        </AuthProvider>
      </CartProvider>
    </BrowserRouter>
  )
}
