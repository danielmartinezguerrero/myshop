import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Header from './components/Header'
import InactivityModal from './components/InactivityModal'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { useAuth } from './hooks/useAuth'
import { useInactivityTimer } from './hooks/useInactivityTimer'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderDetailPage from './pages/OrderDetailPage'
import ProtectedRoute from './components/ProtectedRoute'

const App = () => {
  const { isAuthenticated, rememberMe, logout, isInitializing } = useAuth()
  const navigate = useNavigate()

  // Only track inactivity if logged in AND "Remember me" is unchecked
  const trackInactivity = isAuthenticated && !rememberMe

  const { showWarning, secondsLeft, stayActive } = useInactivityTimer({
    enabled: trackInactivity,
    onTimeout: () => {
      logout()
      navigate('/login')
    },
  })

  // "Sign out now" button
  const handleSignOutNow = () => {
    stayActive()
    logout()
    navigate('/login')
  }

  // While we're validating a stored token, don't render routes yet.
  // Otherwise protected pages would flash their logged-out state first.
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <Header />
      <main>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Require authentication */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:orderNumber"
            element={
              <ProtectedRoute>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {showWarning && trackInactivity && (
        <InactivityModal
          secondsLeft={secondsLeft}
          onStayActive={stayActive}
          onSignOut={handleSignOutNow}
        />
      )}
    </>
  )
}

export default App