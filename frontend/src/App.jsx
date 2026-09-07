import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { useState } from 'react'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import CustomCursor from './components/CustomCursor'
import Header from './components/Header'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import CheckoutModal from './components/CheckoutModal'
import Home from './pages/Home'
import CollectionPage from './pages/CollectionPage'
import ProductDetail from './pages/ProductDetail'
import Contact from './pages/Contact'
import RefundPolicy from './pages/RefundPolicy'
import ShippingPolicy from './pages/ShippingPolicy'
import SizingChart from './pages/SizingChart'
import AdminLayout from './admin/AdminLayout'
import Login from './admin/Login'
import Dashboard from './admin/Dashboard'
import ProductsTable from './admin/ProductsTable'
import OrdersTable from './admin/OrdersTable'

function StorefrontLayout() {
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  return (
    <div className="font-body bg-obsidian text-ivory min-h-screen flex flex-col relative">
      <div className="grain-overlay" aria-hidden="true" />
      <CustomCursor />
      <Header onCartOpen={() => setCartOpen(true)} />
      {/* pt accounts for fixed header: h-16 mobile + h-10 nav on desktop */}
      <main className="flex-grow pt-16 lg:pt-[104px]">
        <Outlet />
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
            <Route path="/" element={<StorefrontLayout />}>
              <Route index element={<Home />} />
              <Route
                path="products"
                element={
                  <CollectionPage
                    title="All Products"
                    description="Browse our complete collection of modest luxury clothing and accessories."
                  />
                }
              />
              <Route
                path="abayas"
                element={
                  <CollectionPage
                    category="abaya"
                    title="Abaya Collection"
                    description="Flowing, elegant abayas crafted for the modern modest wardrobe."
                  />
                }
              />
              <Route
                path="thobes"
                element={
                  <CollectionPage
                    category="thobe"
                    title="Thobe Collection"
                    description="Heritage tailoring meets contemporary refinement."
                  />
                }
              />
              <Route
                path="accessories"
                element={
                  <CollectionPage
                    category="accessory"
                    title="Accessories"
                    description="Curated details to complete your look with intention."
                  />
                }
              />
              <Route path="product/:slug" element={<ProductDetail />} />
              <Route path="contact" element={<Contact />} />
              <Route path="refund-policy" element={<RefundPolicy />} />
              <Route path="shipping-policy" element={<ShippingPolicy />} />
              <Route path="sizing-chart" element={<SizingChart />} />
            </Route>

            {/* Admin — its own layout, unaffected by storefront theme */}
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
