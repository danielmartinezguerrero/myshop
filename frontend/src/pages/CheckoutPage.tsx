import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { placeOrder } from '../services/order.service'
import { useAuth } from '../hooks/useAuth'

const CheckoutPage = () => {
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const { cart, itemCount, totalPrice, refreshCart } = useCart()

  const [isPlacing, setIsPlacing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePlaceOrder = async () => {
    if (!token) return

    setIsPlacing(true)
    setError(null)

    try {
      const order = await placeOrder(token)
      // The backend emptied the cart, so refresh our copy before leaving
      await refreshCart()
      navigate(`/orders/${order.orderNumber}`, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsPlacing(false)
    }
  }

  const isEmpty = !cart || cart.items.length === 0

  if (isEmpty) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Nothing to check out</h1>
        <p className="text-gray-600 mb-6">Your cart is empty.</p>
        <Link
          to="/"
          className="inline-block bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
        >
          Browse subscriptions
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link to="/cart" className="text-sm text-gray-600 hover:text-gray-900 mb-6 inline-block">
        ← Back to cart
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
          {error}
          {/* Availability errors are fixable from the cart */}
          {error.includes('slot') && (
            <Link to="/cart" className="underline ml-1 hover:no-underline">
              Update your cart
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Account details — read-only, no payment collected */}
          <section className="border border-gray-200 rounded-xl p-5">
            <h2 className="font-medium text-gray-900 mb-4">Account</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Name</dt>
                <dd className="text-gray-900">{user?.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Email</dt>
                <dd className="text-gray-900">{user?.email}</dd>
              </div>
            </dl>
          </section>

          {/* Items */}
          <section className="border border-gray-200 rounded-xl p-5">
            <h2 className="font-medium text-gray-900 mb-4">
              Your subscriptions ({itemCount})
            </h2>

            <ul className="divide-y divide-gray-100">
              {cart.items.map((item) => (
                <li key={item.id} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-16 h-14 object-cover rounded-lg bg-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.product.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} slot{item.quantity !== 1 ? 's' : ''} ·
                      €{Number(item.product.price).toFixed(2)} each
                    </p>
                  </div>
                  <span className="font-medium text-gray-900 shrink-0">
                    €{(Number(item.product.price) * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Payment — simulated */}
          <section className="border border-gray-200 rounded-xl p-5">
            <h2 className="font-medium text-gray-900 mb-2">Payment</h2>
            <p className="text-sm text-gray-500">
              This is a portfolio project — no payment is processed and no card details
              are collected. Placing the order simulates a successful purchase.
            </p>
          </section>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="border border-gray-200 rounded-xl p-5 lg:sticky lg:top-24">
            <h2 className="font-medium text-gray-900 mb-4">Summary</h2>

            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Slots</span>
              <span>{itemCount}</span>
            </div>

            <div className="flex justify-between text-sm text-gray-600 pb-4 border-b border-gray-200">
              <span>Billing</span>
              <span>Monthly</span>
            </div>

            <div className="flex justify-between items-baseline py-4">
              <span className="font-medium text-gray-900">Total</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900">
                  €{totalPrice.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500"> /month</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isPlacing}
              className="w-full bg-gray-900 hover:bg-gray-700 disabled:bg-gray-300 text-white font-medium rounded-lg py-3 transition-colors"
            >
              {isPlacing ? 'Placing order...' : 'Place order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage