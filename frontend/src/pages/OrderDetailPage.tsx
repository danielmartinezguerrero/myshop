import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { fetchOrderByNumber } from '../services/order.service'
import type { Order } from '../types/Order'

const OrderDetailPage = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const { token, isAuthenticated } = useAuth()

  const [order, setOrder] = useState<Order | null>(null)
  // Only start in a loading state if we actually have something to fetch.
  // The lazy initialiser avoids calling setState inside the effect below.
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(token && orderNumber))
  const [error, setError] = useState<string | null>(null)
  

  useEffect(() => {
    if (!token || !orderNumber) {
      return
    }

    let ignore = false

    const load = async () => {
      try {
        const data = await fetchOrderByNumber(token, orderNumber)
        if (!ignore) setOrder(data)
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : 'Order not found')
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    load()

    return () => {
      ignore = true
    }
  }, [token, orderNumber])

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-600 mb-6">Sign in to view this order.</p>
        <Link
          to="/login"
          className="inline-block bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
        >
          Sign in
        </Link>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="h-32 bg-gray-100 rounded-xl mb-6 animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h1>
        <p className="text-gray-600 mb-6">
          This order doesn't exist or doesn't belong to your account.
        </p>
        <Link
          to="/orders"
          className="inline-block bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
        >
          View your orders
        </Link>
      </div>
    )
  }

  const placedAt = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Confirmation banner */}
      <div className="border border-green-200 bg-green-50 rounded-xl p-6 mb-8 text-center">
        <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Order confirmed</h1>
        <p className="text-gray-600 text-sm">
          Your subscription slots are reserved. Details below.
        </p>
      </div>

      {/* Order meta */}
      <div className="border border-gray-200 rounded-xl p-5 mb-6">
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-gray-500 mb-1">Order number</dt>
            <dd className="text-gray-900 font-medium">{order.orderNumber}</dd>
          </div>
          <div>
            <dt className="text-gray-500 mb-1">Placed on</dt>
            <dd className="text-gray-900 font-medium">{placedAt}</dd>
          </div>
          <div>
            <dt className="text-gray-500 mb-1">Status</dt>
            <dd>
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-md font-medium">
                {order.status}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      {/* Items — uses the snapshot values, not current product data */}
      <div className="border border-gray-200 rounded-xl p-5">
        <h2 className="font-medium text-gray-900 mb-4">Items</h2>

        <ul className="divide-y divide-gray-100 mb-4">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-4 py-3 first:pt-0">
              <img
                src={item.product.imageUrl}
                alt={item.productName}
                className="w-16 h-14 object-cover rounded-lg bg-gray-100 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <Link
                  to={`/products/${item.product.slug}`}
                  className="font-medium text-gray-900 hover:underline truncate block"
                >
                  {item.productName}
                </Link>
                <p className="text-sm text-gray-500">
                  {item.quantity} slot{item.quantity !== 1 ? 's' : ''} ·
                  €{Number(item.unitPrice).toFixed(2)} each
                </p>
              </div>
              <span className="font-medium text-gray-900 shrink-0">
                €{(Number(item.unitPrice) * item.quantity).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex justify-between items-baseline pt-4 border-t border-gray-200">
          <span className="font-medium text-gray-900">Total</span>
          <div className="text-right">
            <span className="text-2xl font-bold text-gray-900">
              €{Number(order.total).toFixed(2)}
            </span>
            <span className="text-sm text-gray-500"> /month</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Link
          to="/"
          className="flex-1 text-center border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-lg py-2.5 transition-colors"
        >
          Continue browsing
        </Link>
        <Link
          to="/orders"
          className="flex-1 text-center bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium rounded-lg py-2.5 transition-colors"
        >
          All orders
        </Link>
      </div>
    </div>
  )
}

export default OrderDetailPage