import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import CustomCursor from './components/CustomCursor'
import Header from './components/Header'
import Hero from './components/Hero'
import CategoryCards from './components/CategoryCards'
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
    <div className="font-body bg-cream text-espresso overflow-x-hidden min-h-screen flex flex-col w-full relative">
      {/* Grain overlay sits above everything */}
      <div className="grain-overlay" aria-hidden="true" />

      {/* Custom cursor (desktop only via CSS) */}
      <CustomCursor />

      <Header onCartOpen={() => setCartOpen(true)} />

      <main className="flex-grow pb-8">
        <Hero />
        <CategoryCards />
        <ProductGrid id="abayas"      category="abaya"     title="Abaya Collection" />
        <ProductGrid id="thobes"      category="thobe"     title="Thobe Collection" />
        <ProductGrid id="accessories" category="accessory" title="Other Collections" />
        <BrandBand />
      </main>

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
